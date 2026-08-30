import { Component, inject } from '@angular/core';
import { TaskStore } from '../../tasks/tasks.store';

@Component({
    selector: 'app-loader',
    imports: [],
    templateUrl: './loader.html',
    styleUrl: './loader.scss',
    providers: [TaskStore]
})
export class Loader {
    protected readonly store = inject(TaskStore);
    protected readonly isLoading = this.store.isLoading;
}
