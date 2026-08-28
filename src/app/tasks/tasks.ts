import { DatePipe } from '@angular/common';
import { HttpClient, httpResource } from '@angular/common/http';
import { Component, inject, linkedSignal, signal, debounced } from '@angular/core';
import { form, FormField, FormRoot, maxLength, minLength, required } from '@angular/forms/signals';
import { Task, TaskPriorityFilter, TaskStatusFilter } from './task.model';
import { TaskService } from './task.service';
import { TaskStore } from './tasks.store';

export type TaskModel = Pick<Task, 'title' | 'description' | 'dueDate' | 'status' | 'priority'>;

@Component({
    selector: 'app-tasks',
    imports: [FormField, FormRoot, DatePipe],
    templateUrl: './tasks.html',
    styleUrl: './tasks.scss',
    providers: [TaskStore],
})
export class Tasks {
    protected readonly taskService = inject(TaskService);
    protected readonly taskStore = inject(TaskStore);

    protected readonly tasksFrmStore = this.taskStore.tasks;

    protected formState = signal<'create' | 'update'>('create');
    protected updateId = signal<string>('');
    protected search = this.taskStore.filter.search;
    protected status = this.taskStore.filter.status;
    protected priority = this.taskStore.filter.priority;

    protected readonly taskForm = signal<TaskModel>({
        title: '',
        description: '',
        dueDate: new Date().toISOString().split('T')[0],
        priority: 'low',
        status: 'todo',
    });

    protected form = form(this.taskForm, (path) => {
        (required(path.title),
            minLength(path.title, 3),
            maxLength(path.title, 255),
            maxLength(path.description, 2000));
    });

    public delete(id: string): void {
        this.taskStore.deleteTask({ id });
    }

    public submit(): void {
        if (this.formState() === 'create') {
            this.taskStore.createTask(this.form().value());
        } else if (this.formState() === 'update') {
            this.taskStore.updateTask({ id: this.updateId(), body: this.form().value() });
        }
        this.clear();
    }

    public handleSearch(event: Event): void {
        if (event.target) {
            const target = event.target as HTMLInputElement;
            this.taskStore.updateSearch(target.value);
        }
    }

    public handleStatus(event: Event): void {
        if (event.target) {
            const target = event.target as HTMLInputElement;
            this.taskStore.updateStatus(target?.value as TaskStatusFilter);
        }
    }

    public handlePriority(event: Event): void {
        if (event.target) {
            const target = event.target as HTMLInputElement;
            this.taskStore.updatePriority(target?.value as TaskPriorityFilter);
        }
    }

    public update(task: Task): void {
        this.updateId.set(task.id);
        this.formState.set('update');
        this.form().reset({
            title: task.title,
            description: task.description || '',
            dueDate: new Date(task.dueDate).toISOString().split('T')[0],
            priority: task.priority,
            status: task.status,
        });
    }

    public clear(): void {
        this.formState.set('create');
        this.form().reset({
            title: '',
            description: '',
            dueDate: new Date().toISOString().split('T')[0],
            priority: 'low',
            status: 'todo',
        });
    }

    public clearFilter(): void {
        this.taskStore.updateSearch('');
        this.taskStore.updateStatus('');
        this.taskStore.updatePriority('');
    }
}
