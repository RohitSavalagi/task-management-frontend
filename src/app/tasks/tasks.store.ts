import {
    patchState,
    signalStore,
    withComputed,
    withHooks,
    withMethods,
    withProps,
    withState,
} from '@ngrx/signals';
import { TaskModel, TaskPriorityFilter, TaskStatusFilter, type Task } from './task.model';
import { computed, inject } from '@angular/core';
import { TaskService } from './task.service';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { debounceTime, distinctUntilChanged, EMPTY, pipe, switchMap, tap } from 'rxjs';
import { withDevtools } from '@angular-architects/ngrx-toolkit';

export interface TaskState {
    tasks: Task[];
    isLoading: boolean;
    filter: {
        search: string;
        status: TaskStatusFilter;
        priority: TaskPriorityFilter;
    };
    todoTasks: Task[],
    progressTasks: Task[],
    doneTasks: Task[],
}

export const InitialState: TaskState = {
    tasks: [],
    isLoading: false,
    todoTasks: [],
    progressTasks: [],
    doneTasks: [],
    filter: {
        search: '',
        status: '',
        priority: '',
    },
};

export const TaskStore = signalStore(
    withDevtools('Task'),
    withState(InitialState),
    withProps(() => ({
        _taskService: inject(TaskService),
    })),
    withComputed(({ filter, tasks }) => ({
        taskFilters: computed(() => ({
            search: filter.search(),
            status: filter.status(),
            priority: filter.priority(),
        })),
        todoTasks: computed(() =>
            tasks().filter(task => task.status === 'todo')
        ),
        progressTasks: computed(() =>
            tasks().filter(task => task.status === 'in_progress')
        ),
        doneTasks: computed(() =>
            tasks().filter(task => task.status === 'done')
        )
    })),
    withMethods((store) => ({
        updateSearch: (search: string) => {
            patchState(store, (state) => ({
                filter: { ...state.filter, search },
            }));
        },
        updateStatus: (status: TaskStatusFilter) => {
            patchState(store, (state) => ({
                filter: { ...state.filter, status },
            }));
        },
        updatePriority: (priority: TaskPriorityFilter) => {
            patchState(store, (state) => ({
                filter: { ...state.filter, priority },
            }));
        },
        createTask: rxMethod<TaskModel>(
            pipe(
                tap(() => patchState(store, { isLoading: true })),
                switchMap((body) =>
                    store._taskService.createTask(body).pipe(
                        tapResponse({
                            next: (task) => {
                                patchState(store, (state) => ({
                                    tasks: [...state.tasks, task],
                                }))
                            },
                            error: (error) => console.log(error),
                            finalize: () => patchState(store, { isLoading: false }),
                        })
                    )
                )
            )
        ),
        updateTask: rxMethod<{id: string, body: TaskModel}>(
            pipe(
                tap(() => patchState(store, { isLoading: true })),
                switchMap(({ id, body }) =>
                    store._taskService.updateTask(id, body).pipe(
                        tapResponse({
                            next: (task) => {
                                patchState(store, (state) => ({
                                    tasks: state.tasks.map(t => {
                                        if (t.id === task.id) return task;
                                        return t;
                                    }),
                                }))
                            },
                            error: (error) => console.log(error),
                            finalize: () => patchState(store, { isLoading: false }),
                        })
                    )
                )
            )
        ),
        updateTaskStatus: rxMethod<{ id: string, status: TaskStatusFilter }>(
            pipe(
                tap(() => patchState(store, { isLoading: true })),
                switchMap(({ id, status }) => {
                    let taskToBeUpdated = store.tasks().find(task => task.id === id);
                    if (taskToBeUpdated) {
                        taskToBeUpdated = { ...taskToBeUpdated, status };
                        return store._taskService.updateTask(id, { status }).pipe(
                            tapResponse({
                                next: (updatedTask) => {
                                    patchState(store, (state) => ({
                                        tasks: state.tasks.map(task => {
                                            if (task.id === updatedTask.id) {
                                                return updatedTask;
                                            }
                                            return task;
                                        })
                                    }))
                                },
                                error: (error) => console.log(error),
                                finalize: () => patchState(store, { isLoading: false })
                            })
                        );
                    }
                    return EMPTY;
                })
            )
        ),
        deleteTask: rxMethod<{ id: string }>(
            pipe(
                tap(() => patchState(store, { isLoading: true })),
                switchMap(({ id }) =>
                    store._taskService.deleteTask(id).pipe(
                        tapResponse({
                            next: () => {
                                patchState(store, (state) => ({
                                    tasks: state.tasks.filter((task) => task.id !== id)
                                }))
                            },
                            error: (error) => console.log(error),
                            finalize: () => patchState(store, { isLoading: false }),
                        })
                    )
            )
            )
        ),
        loadAllTasks: rxMethod<{
            search: string;
            status: TaskStatusFilter;
            priority: TaskPriorityFilter;
        }>(
            pipe(
                debounceTime(500),
                distinctUntilChanged(
                    (prev, cur) =>
                        prev.search === cur.search &&
                        prev.priority === cur.priority &&
                        prev.status === cur.status
                ),
                tap(() => {
                    patchState(store, { isLoading: true })
                }),
                switchMap(({ search, status, priority }) =>
                    store._taskService
                        .getTasks({
                            search,
                            status,
                            priority,
                        })
                        .pipe(
                            tapResponse({
                                next: (tasks) => {
                                    patchState(store, () => ({ tasks }));
                                },
                                error: (error) => console.log(error),
                                finalize: () => {
                                    patchState(store, { isLoading: false });
                                }
                            }),
                        ),
                ),
            ),
        ),
    })),
    withHooks({
        onInit(store) {
            store.loadAllTasks(store.taskFilters);
        }
    })
);
