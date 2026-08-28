import { HttpClient, httpResource, HttpResourceRef } from '@angular/common/http';
import { inject, Service, Signal } from '@angular/core';
import { Task, TaskModel } from './task.model';
import { Observable } from 'rxjs';

export interface TaskFilters {
    search: string;
    status: 'todo' | 'in_progress' | 'done' | '';
    priority: 'low' | 'medium' | 'high' | '';
}

@Service()
export class TaskService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = 'http://localhost:3000/tasks';

    getTasks(filters: TaskFilters): Observable<Task[]> {
        return this.http.get<Task[]>(this.baseUrl, {
            params: {
                search: filters.search,
                status: filters.status,
                priority: filters.priority,
            },
        });
    }

    public createTask(body: TaskModel): Observable<Task> {
        return this.http.post<Task>(this.baseUrl, body);
    }

    public updateTask(id: string, body: TaskModel): Observable<Task> {
        return this.http.put<Task>(this.baseUrl + '/' + id, body);
    }

    public deleteTask(id: string): Observable<unknown> {
        return this.http.delete<unknown>(this.baseUrl + '/' + id);
    }
}
