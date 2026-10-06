import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CoverLetter } from '../model/coverLetter';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('cover-letter-generator');
  private http = inject(HttpClient);
  private coverLetterUrl = "http://localhost:4201/generateCoverLetter";
  private uploadFileUrl = "http://localhost:4201/uploadFile";
  private getCoverLettersUrl = "http://localhost:4201/getCoverLetters";  
  private fileCount: number = 1;
  public selectedFiles: number[] = [];
  public files: CoverLetter[] = [];
  public cvs: CoverLetter[] = [];
  public selectedCv: number = -1;

  private isUploadedFileCv = false;

  async ngOnInit() {
    await this.getCoverLetters();
  }

  toggleIsCv() {
    this.isUploadedFileCv = this.isUploadedFileCv === false ? true : false;
  }

  getCoverLetters() {
    this.http.get< { body: CoverLetter[] }>(this.getCoverLettersUrl)
        .subscribe(data => {
          for (const file of data.body) {
            if (file.isCv) {
              this.cvs.push(file);
            } else {
              this.files.push(file);
            }
          }
          this.files.sort((a, b) => a.id - b.id);
          this.cvs.sort((a, b) => a.id - b.id);
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

  generateCoverLetter() {
    let fileIds: string[] = [];
    if (this.selectedCv !== -1) {
    }

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

    this.http.post<{ files: string[] }>(this.coverLetterUrl, { files: fileIds })
        .subscribe(response => {
            response.files.forEach(b64 => {
              const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
              this.downloadFile(new Blob([bytes], {
                  type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
              }));
          });
        });
  }

  downloadFile(fileBlob: Blob) {
    saveAs(fileBlob, 'file' + this.fileCount + '.docx');
    this.fileCount++;
  }

  uploadFile(event: Event) {
    console.log("UploadFile hit");
    const uploadElement = event.target as HTMLInputElement;
    let fileList: FileList | null = uploadElement.files;

    if (!fileList || fileList.length === 0) return;

    const file = fileList[0];
    const formData = new FormData();
    formData.append('file', file, file.name);

    this.http.post(this.uploadFileUrl, formData)
      .subscribe(data => {
        console.log(data);
        this.getCoverLetters();
      });
    
  }
}
