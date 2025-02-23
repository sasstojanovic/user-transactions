import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from './services/user.service';
import { map, take, tap } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  return userService.isAuthenticated.pipe(
    take(1),
    tap((isAuth) => {
      if (!isAuth) {
        router.navigate(['/signin']);
      } else if (route.routeConfig?.path === 'signin') {
        router.navigate(['/']);
      }
    }),
    map((isAuth) => route.routeConfig?.path !== 'signin' || !isAuth)
  );
};
