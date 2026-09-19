import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { testRequest } from '../model/request/test_request';
import { HttpClient } from '@angular/common/http';
import { CoverLetter } from '../model/coverLetter';

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
  private testConnectionUrl = "http://localhost:4201/testConnection";
  private uploadFileUrl = "http://localhost:4201/uploadFile";
  private getCoverLettersUrl = "http://localhost:4201/getCoverLetters";  
  public selectedFiles: number[] = [];
  public files: CoverLetter[] = [];


  async ngOnInit() {
    await this.getCoverLetters();
    console.log(this.files);
  }

  getCoverLetters() {
    this.http.get< { body: CoverLetter[] }>(this.getCoverLettersUrl)
        .subscribe(data => {
            this.files = data.body;
        });
    this.files.sort((a, b) => a.id - b.id);
  }

  selectCoverLetter(fileId: number) {
    if (this.selectedFiles.includes(fileId)) {
      this.selectedFiles.splice(this.selectedFiles.indexOf(fileId), 1);
    } else {
      this.selectedFiles.push(fileId);
    }
  }

  generateCoverLetter() {
    let fileIds: string[] = [];

    console.log(this.selectedFiles);

    for (const id of this.selectedFiles) {
      for (const file of this.files) {
        if (file.id === id) {
          fileIds.push(file.fileId);
        }
      }
    }

    this.http.post<{ message: unknown }>(this.coverLetterUrl, { files: fileIds })
        .subscribe(data => {
            console.log(data.message);
        });
  }

  testConnection() {
    this.http.get< { body: object }>(this.testConnectionUrl)
        .subscribe(data => {
            console.log(data.body);
        });
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
