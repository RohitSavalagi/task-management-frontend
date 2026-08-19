import { AsyncPipe, JsonPipe } from '@angular/common';
import { HttpClient, httpResource } from '@angular/common/http';
import { Component, inject, Signal } from '@angular/core';
import { Observable } from 'rxjs';

export interface Task {
  title: string;
  description: string;
  priority: string;
  status: string;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

@Component({
  selector: 'app-tasks',
  imports: [JsonPipe],
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss',
})
export class Tasks {
  protected tasks: Signal<Task[] | undefined>  = httpResource<Task[]>(() => ({
      url: 'http://localhost:3000/tasks',
    })).value;
}
