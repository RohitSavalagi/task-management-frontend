import { Component, inject } from '@angular/core';
import { TaskStore } from '../tasks/tasks.store';
import { TaskCard } from '../task-card/task-card';
import {
    CdkDragDrop,
    DragDropModule,
    moveItemInArray,
    transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Task, TaskStatus } from '../tasks/task.model';

@Component({
    selector: 'app-dashboard',
    imports: [TaskCard, DragDropModule],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.scss',
    providers: [TaskStore],
})
export class Dashboard {
    private readonly taskStore = inject(TaskStore);

    protected readonly todoTasks = this.taskStore.todoTasks;
    protected readonly progressTasks = this.taskStore.progressTasks;
    protected readonly doneTasks = this.taskStore.doneTasks;

    public drop(event: CdkDragDrop<Task[]>): void {
        const { item, previousContainer, container } = event;
        const draggedItemData = item.data;

        if (event.previousContainer === event.container) {
            return;
        }

        const task = event.item.data as Task;
        const newStatus = this.getStatusFromContainer(event.container.id);
        this.taskStore.updateTaskStatus({ id: task.id, status: newStatus });
    }

    private getStatusFromContainer(id: string): TaskStatus {
        switch (id) {
            case 'todoList':
                return TaskStatus.TODO;

            case 'inProgressList':
                return TaskStatus.IN_PROGRESS;

            case 'doneList':
                return TaskStatus.DONE;

            default:
                throw new Error(`Unknown task container: ${id}`);
        }
    }
}
