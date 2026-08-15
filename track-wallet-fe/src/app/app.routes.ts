import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'accounts',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/accounts/accounts.component').then((m) => m.AccountsComponent),
  },
  {
    path: 'categories',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/categories/categories.component').then((m) => m.CategoriesComponent),
  },
  {
    path: 'categories/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/category-edit/edit-categories.component').then(
        (m) => m.EditCategoriesComponent
      ),
  },
  { path: 'categories/new', redirectTo: 'categories/edit', pathMatch: 'full' },
  {
    path: 'categories/:parentId/subcategories/new',
    redirectTo: 'categories/edit',
  },
  {
    path: 'categories/:id/icon',
    redirectTo: 'categories/edit',
  },
  {
    path: 'categories/:id',
    redirectTo: 'categories/edit',
  },
  {
    path: 'analytics',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/analytics/analytics.component').then((m) => m.AnalyticsComponent),
  },
  {
    path: 'transactions',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/transactions/transactions.component').then(
        (m) => m.TransactionsComponent
      ),
  },
  { path: 'transactions/new', redirectTo: 'transactions', pathMatch: 'full' },
  { path: 'transactions/:id', redirectTo: 'transactions' },
  {
    path: 'filters',
    redirectTo: 'transactions',
    pathMatch: 'full',
  },
  { path: '**', redirectTo: 'home' },
];
