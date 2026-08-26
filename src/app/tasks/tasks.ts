import { DatePipe } from '@angular/common';
import { HttpClient, httpResource } from '@angular/common/http';
import { Component, inject, linkedSignal, signal, debounced } from '@angular/core';
import { form, FormField, FormRoot, minLength, required } from '@angular/forms/signals';

export enum TaskStatus {
    TODO = 'todo',
    IN_PROGRESS = 'in_progress',
    DONE = 'done',
}

export enum TaskPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
}

export interface Task {
    title: string;
    description: string;
    status: 'todo' | 'in_progress' | 'done' | '';
    dueDate: string;
    createdAt: Date;
    updatedAt: Date;
    priority: 'low' | 'medium' | 'high';
    id: string;
}

export type TaskModel = Pick<Task, 'title' | 'description' | 'dueDate' | 'status' | 'priority'>;

@Component({
    selector: 'app-tasks',
    imports: [FormField, FormRoot, DatePipe],
    templateUrl: './tasks.html',
    styleUrl: './tasks.scss',
})
export class Tasks {
    protected readonly url = 'http://localhost:3000/tasks';
    protected readonly http = inject(HttpClient);
    protected formState = signal<'create' | 'update'>('create');
    protected updateId = signal<string>('');
    protected search = signal('');
    protected status = signal<'todo' | 'in_progress' | 'done' | ''>('');
    protected priority = signal<'low' | 'medium' | 'high' | ''>('');
    protected debouncedSearch = debounced(this.search, 500);

    protected tasksResource = httpResource<Task[]>(() => ({
        url: this.url,
        params: {
            search: this.debouncedSearch.value(),
            status: this.status(),
            priority: this.priority(),
        },
    }));

    protected tasks = linkedSignal<Task[]>(() => {
        return this.tasksResource.value() ?? [];
    });

    protected readonly taskForm = signal<TaskModel>({
        title: '',
        description: '',
        dueDate: new Date().toISOString().split('T')[0],
        priority: 'low',
        status: 'todo',
    });

    protected form = form(this.taskForm, (path) => {
        (required(path.title), minLength(path.title, 3), minLength(path.description, 3));
    });

    public delete(id: string): void {
        this.http.delete(this.url + '/' + id).subscribe({
            next: () => {
                this.tasks.update((tasks) => {
                    return tasks.filter((task) => parseInt(task.id) !== parseInt(id));
                });
            },
            error: (error) => {
                console.log(error);
            },
        });
    }

    public submit(): void {
        if (this.formState() === 'create') {
            this.http.post<Task>(this.url, this.form().value()).subscribe({
                next: (createdTask: Task) => {
                    this.clear();
                    this.tasks.update((tasks) => [...tasks, createdTask]);
                },
                error: (error) => {
                    console.log(error);
                },
            });
        } else if (this.formState() === 'update') {
            this.http.put<Task>(this.url + '/' + this.updateId(), this.form().value()).subscribe({
                next: (updatedTask: Task) => {
                    this.clear();
                    this.tasks.update((tasks) => {
                        return (tasks = tasks.map((task) => {
                            if (task.id === this.updateId()) {
                                return updatedTask;
                            }
                            return task;
                        }));
                    });
                },
                error: (error) => {
                    console.log(error);
                },
            });
        }
    }

    public handleSearch(event: Event): void {
        if (event.target) {
            const target = event.target as HTMLInputElement;
            this.search.set(target?.value);
        }
    }

    public handleStatus(event: Event): void {
        if (event.target) {
            const target = event.target as HTMLInputElement;
            this.status.set(target?.value as 'todo' | 'in_progress' | 'done');
        }
    }

    public handlePriority(event: Event): void {
        if (event.target) {
            const target = event.target as HTMLInputElement;
            this.priority.set(target?.value as 'low' | 'medium' | 'high');
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
        this.search.set('');
        this.status.set('');
        this.priority.set('');
    }
}
