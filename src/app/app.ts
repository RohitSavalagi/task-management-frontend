import { Component, signal } from '@angular/core';
import { Tasks } from "./tasks/tasks";
import { RouterOutlet } from '@angular/router';
import { Loader } from "./shared/loader/loader";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Loader],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('frontend');
}
