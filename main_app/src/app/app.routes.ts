import { loadRemoteModule } from '@angular-architects/native-federation';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./shared/shell').then((m) => m.ShellComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'dashboard2',
        loadComponent: () => import('./pages/dashboard2/dashboard2').then((m) => m.Dashboard2),
      },{
        path: 'analytics',
        loadComponent: () => import('./pages/analytics/analytics').then((m) => m.Analytics),
      },
      {
        path: 'menu2',
        loadComponent: () => import('./pages/menu2/menu2').then((m) => m.Menu2),
      },
      {
        path: 'menu',
        loadComponent: () => loadRemoteModule('panel_constructor','./Component').then((m) => m.App),
      }
    ],
  },
];
