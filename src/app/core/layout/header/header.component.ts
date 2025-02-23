import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { UserService } from '../../auth/services/user.service';

import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { Ripple } from 'primeng/ripple';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    Menubar,
    BadgeModule,
    AvatarModule,
    InputTextModule,
    Ripple,
    ButtonModule,
  ],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  private destroyRef = inject(DestroyRef);
  items: MenuItem[] | undefined;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.items = [
      {
        label: 'My Account',
        icon: 'pi pi-home',
        routerLink: '/',
      },
      {
        label: 'Transactions',
        icon: 'pi pi-home',
        routerLink: '/transactions',
      },
    ];

    this.userService
      .isAdmin()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((isAdmin) => {
        if (isAdmin) {
          this.items?.push({
            label: 'Admin',
            icon: 'pi pi-home',
            routerLink: '/users',
          });
        }
      });
  }

  signOut() {
    this.userService.purgeAuth();
    this.router.navigate(['/signin']);
  }
}
