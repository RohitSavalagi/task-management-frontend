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
    status: TaskStatusFilter;
    dueDate: string;
    createdAt: Date;
    updatedAt: Date;
    priority: TaskPriorityFilter;
    id: string;
}

export type TaskModel = Pick<Task, 'title' | 'description' | 'dueDate' | 'status' | 'priority'>;

export type TaskStatusFilter = 'todo' | 'in_progress' | 'done' | '';
export type TaskPriorityFilter = 'low' | 'medium' | 'high' | '';
