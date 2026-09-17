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
  private echoUrl = "http://localhost:4201/echo";
  private coverLetterUrl = "http://localhost:4201/generateCoverLetter";
  private testConnectionUrl = "http://localhost:4201/testConnection";
  private uploadFileUrl = "http://localhost:4201/uploadFile";
  private getCoverLettersUrl = "http://localhost:4201/getCoverLetters";
  public files: CoverLetter[] = [];

  ngOnInit(): void {
    this.http.get< { body: CoverLetter[] }>(this.getCoverLettersUrl)
        .subscribe(data => {
            this.files = data.body;
        });
  }

  testRequest() {
    const requestBody = new testRequest("A string that should be echoed");

    this.http
        .post<testRequest>(this.echoUrl, requestBody, { observe: "body" })
        .subscribe(data => {
          console.log(data.contents)
        });
  }

  generateCoverLetter() {
    this.http.get< { body: object }>(this.coverLetterUrl)
        .subscribe(data => {
            console.log(data.body);
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
      });
  }
}
