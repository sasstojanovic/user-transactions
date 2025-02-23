import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from './core/layout/header/header.component';
import { UserService } from './core/auth/services/user.service';

import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, CommonModule, ConfirmDialogModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [ConfirmationService],
})
export class AppComponent {
  title = 'User Transactions';
  isAuthenticated$: Observable<boolean>;

  constructor(private userService: UserService) {
    this.isAuthenticated$ = this.userService.isAuthenticated;
  }
}
