import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { submitPrompt } from './submitPrompt';
import { testRequest } from '../model/request/test_request';
import { HttpClient, HttpRequest } from '@angular/common/http';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('cover-letter-generator');
  private http = inject(HttpClient);
  private url = "http://localhost:4201/echo";

  submitPrompt() {
    submitPrompt();
  }

  testRequest() {
    const requestBody = new testRequest("A string that should be echoed");

    this.http
        .post<testRequest>(this.url, requestBody, { observe: "body" })
        .subscribe(data => {
          console.log(data.contents)
        });
  }
}
