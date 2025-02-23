import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from './services/user.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  return userService.isAuthenticated.pipe(
    take(1),
    map((isAuth) => {
      if (!isAuth && route.routeConfig?.path !== 'signin') {
        router.navigate(['/signin']);
        return false;
      }
      if (isAuth && route.routeConfig?.path === 'signin') {
        router.navigate(['/']);
        return false;
      }
      return true;
    })
  );
};
