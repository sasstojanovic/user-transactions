import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { adminGuard } from './core/auth/admin.guard';
import { inject } from '@angular/core';
import { UserService } from './core/auth/services/user.service';
import { map } from 'rxjs';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/user/pages/home/home.component').then(
        (c) => c.HomeComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'transactions',
    loadComponent: () =>
      import('./features/user/pages/transactions/transactions.component').then(
        (c) => c.TransactionsComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'signin',
    loadComponent: () =>
      import('./core/auth/auth.component').then((c) => c.AuthComponent),
    canActivate: [authGuard],
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./features/admin/pages/users/users.component').then(
        (c) => c.UsersComponent
      ),
    canActivate: [adminGuard],
  },
  { path: '**', redirectTo: 'signin' },
];
