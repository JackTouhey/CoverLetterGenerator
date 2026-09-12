import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { testRequest } from '../model/request/test_request';
import { HttpClient } from '@angular/common/http';

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

    if(fileList) {
      for(const f of fileList) {
        console.log(f);
      }
    }
  }
}
