import { DatePipe } from '@angular/common';
import { HttpClient, httpResource } from '@angular/common/http';
import { Component, inject, linkedSignal, signal, debounced } from '@angular/core';
import { form, FormField, FormRoot, maxLength, minLength, required } from '@angular/forms/signals';
import { Task, TaskPriorityFilter, TaskStatusFilter } from './task.model';
import { TaskService } from './task.service';

export type TaskModel = Pick<Task, 'title' | 'description' | 'dueDate' | 'status' | 'priority'>;

@Component({
    selector: 'app-tasks',
    imports: [FormField, FormRoot, DatePipe],
    templateUrl: './tasks.html',
    styleUrl: './tasks.scss',
})
export class Tasks {

    protected readonly taskService = inject(TaskService);

    protected formState = signal<'create' | 'update'>('create');
    protected updateId = signal<string>('');
    protected search = signal('');
    protected status = signal<TaskStatusFilter>('');
    protected priority = signal<TaskPriorityFilter>('');
    protected debouncedSearch = debounced(this.search, 500);

    protected tasksResource = this.taskService.getTasks({
        search: this.debouncedSearch.value,
        status: this.status,
        priority: this.priority,
    });

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
        (
            required(path.title),
            minLength(path.title, 3),
            maxLength(path.title, 255),

            maxLength(path.description, 2000)
        );
    });

    public delete(id: string): void {
        this.taskService.deleteTask(id).subscribe({
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
            this.taskService.createTask(this.form().value()).subscribe({
                next: (createdTask: Task) => {
                    this.clear();
                    this.tasks.update((tasks) => [...tasks, createdTask]);
                },
                error: (error) => {
                    console.log(error);
                },
            });
        } else if (this.formState() === 'update') {
            this.taskService.updateTask(this.updateId(), this.form().value()).subscribe({
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
            this.status.set(target?.value as TaskStatusFilter);
        }
    }

    public handlePriority(event: Event): void {
        if (event.target) {
            const target = event.target as HTMLInputElement;
            this.priority.set(target?.value as TaskPriorityFilter);
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
