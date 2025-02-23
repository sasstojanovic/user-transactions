import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map, switchMap, take } from 'rxjs/operators';
import { UserService } from './services/user.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  return userService.isAuthenticated.pipe(
    take(1),
    switchMap((isAuth) => {
      if (!isAuth) {
        router.navigate(['/signin']);
        return [false];
      }

      return userService.isAdmin().pipe(
        map((isAdmin) => {
          if (!isAdmin) {
            router.navigate(['/']);
            return false;
          }
          return true;
        })
      );
    })
  );
};
