import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { Ripple } from 'primeng/ripple';
import { UserService } from '../../auth/services/user.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterModule,
    Menubar,
    BadgeModule,
    AvatarModule,
    InputTextModule,
    Ripple,
    CommonModule,
    ButtonModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  items: MenuItem[] | undefined;
  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
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
  }

  signOut() {
    this.userService.purgeAuth();
    this.router.navigate(['/signin']);
  }
}
