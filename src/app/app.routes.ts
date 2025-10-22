import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
    data: { preload: false }
  },
  {
    path: 'map',
    loadChildren: () => import('./features/map-view/map-view.routes').then(m => m.MAP_VIEW_ROUTES),
    data: { preload: true, preloadDelay: 2000 } // Preload map after 2 seconds
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
