import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { submitPrompt } from './submitPrompt';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('cover-letter-generator');

  submitPrompt() {
    submitPrompt();
  }
}
