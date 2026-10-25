import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';
import { CoverLetter } from '../model/coverLetter';
import { saveAs } from 'file-saver';
import { Role } from '../model/role';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('cover-letter-generator');
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private coverLetterUrl = "http://localhost:4201/generateCoverLetter";
  private uploadFileUrl = "http://localhost:4201/uploadFile";
  private getCoverLettersUrl = "http://localhost:4201/getCoverLetters";  
  private searchForRoleUrl = "http://localhost:4201/searchForRole";
  private insertCompanyAppliedToUrl = "http://localhost:4201/insertCompanyAppliedTo";

  // Uploaded file selection fields
  public selectedFiles: number[] = [];
  public files: CoverLetter[] = [];
  public cvs: CoverLetter[] = [];
  public selectedCv: number = -1;
  private isUploadedFileCv = false;

  // Searching for roles fields

  public searchingForRole = signal(false); 
  // public roleFound = signal(false);
  public areRolesFound = signal(true);
  public coverLetterGenerated = signal(false);
  public rolesFound: Role[] = [ 
      { companyName: "test1", description: "test1 description", url: "test1url.com" },
      { companyName: "test2", description: "test2 description", url: "test1ur2.com" } ];
  public currentRoleIndex = 0;
  public isMoreRoles = signal(true);

  // Cover Letter generation fields
  private acceptedRoles: Role[] = [];
  private coverLetterBlobs: Blob[]= [];
  public generatingCoverLetters = signal(true);

  async ngOnInit() {
    await this.getCoverLetters();
    for (const file of this.files) {
      this.selectedFiles.push(file.id);
    }
    this.cdr.detectChanges();
  }

  toggleIsCv() {
    this.isUploadedFileCv = this.isUploadedFileCv === false ? true : false;
  }

  getCoverLetters() {
    this.cvs = [];
    this.files = [];
    this.http.get< { body: CoverLetter[] }>(this.getCoverLettersUrl)
        .subscribe(response => {
          for (const file of response.body) {
            if (file.isCv) {
              this.cvs.push(file);
            } else {
              this.files.push(file);
            }
          }
          this.files.sort((a, b) => a.id - b.id);
          this.cvs.sort((a, b) => a.id - b.id);
          this.cdr.detectChanges();
        });
  }

  selectCoverLetter(fileId: number) {
    if (this.selectedFiles.includes(fileId)) {
      this.selectedFiles.splice(this.selectedFiles.indexOf(fileId), 1);
    } else {
      if (this.selectedFiles.length < 16) {
        this.selectedFiles.push(fileId);
      }
    }
  }

  selectCv(fileId: number) {
    if (this.selectedCv === fileId) {
      this.selectedCv = -1;
    } else {
      this.selectedCv = fileId;
    }
  }

  uploadFile(event: Event) {
    console.log("UploadFile hit");
    const uploadElement = event.target as HTMLInputElement;
    let fileList: FileList | null = uploadElement.files;

    if (!fileList || fileList.length === 0) return;

    const file = fileList[0];
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('isCv', String(this.isUploadedFileCv));

    this.http.post(this.uploadFileUrl, formData)
      .subscribe(response => {
        console.log(response);
        this.getCoverLetters();
      });
  }

  searchForRole() {
    this.searchingForRole.set(true);
    this.http.get<{ roles: Role[] }>(this.searchForRoleUrl)
        .subscribe(response => {
          this.rolesFound = response.roles;
          this.currentRoleIndex = 0;

          this.areRolesFound.set(true);
          this.searchingForRole.set(false);
        });
  }

  passRole() {
    this.moveToNextRole();
  }

  acceptRole() {
    this.acceptedRoles.push(this.rolesFound[this.currentRoleIndex]);
    this.moveToNextRole();
  }

  moveToNextRole() {
    if (this.rolesFound.length > this.currentRoleIndex + 1) {
      this.currentRoleIndex++;
    } else {
      this.isMoreRoles.set(false);
    }
    this.cdr.detectChanges();
  }


  generateCoverLetter() {
    // TODO: Handle new Roles
    let fileIds: string[] = [];

    // Should be refactored to prevent nested loops
    for (const id of this.selectedFiles) {
      for (const file of this.files) {
        if (file.id === id) {
          fileIds.push(file.fileId);
        }
      }
    }
    for (const file of this.cvs) {
      if (file.id === this.selectedCv) {
        fileIds.push(file.fileId);
      }
    }

    this.generatingCoverLetters.set(true);
    this.http.post<{ files: string[] }>(this.coverLetterUrl, { files: fileIds, roles: this.acceptedRoles })
        .subscribe(response => {
            response.files.forEach(b64 => {
              const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
              this.coverLetterBlobs.push(new Blob([bytes], {
                  type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
              }));
          });
          this.coverLetterGenerated.set(true);
          this.generatingCoverLetters.set(false);
        });
  }

  downloadCoverLetter() {
    let roleIndex = 0;
    for (const coverLetterBlob of this.coverLetterBlobs) {
      this.downloadFile(coverLetterBlob, this.acceptedRoles[roleIndex].companyName);
      this.http.post(this.insertCompanyAppliedToUrl, { companyName: this.acceptedRoles[roleIndex].companyName })
          .subscribe(response => {
          });
    }
  }

  downloadFile(fileBlob: Blob, companyName: string) {
    saveAs(fileBlob, companyName + ' Cover Letter.docx');
  }

  
}
