import { Routes } from '@angular/router';
import { Tasks } from './tasks/tasks';
import { Dashboard } from './dashboard/dashboard';

export const routes: Routes = [
    {
        path: '',
        component: Tasks,

    },
    {
        path: 'dashboard',
        component: Dashboard,

    },
    {
        path: '**',
        redirectTo: ''
    }
];
