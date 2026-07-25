import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { submitPrompt } from './submitPrompt';
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

  submitPrompt() {
    submitPrompt();
  }

  
}
