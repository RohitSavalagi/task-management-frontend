import { Component, input } from '@angular/core';
import { Task } from '../tasks/task.model';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-task-card',
    imports: [DatePipe],
    templateUrl: './task-card.html',
    styleUrl: './task-card.scss',
})
export class TaskCard {
    public readonly task = input.required<Task>();
}
