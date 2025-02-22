import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthComponent } from './core/auth/auth.component';
import { HeaderComponent } from './core/layout/header/header.component';
import { UserService } from './core/auth/services/user.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ButtonModule, HeaderComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'user-transactions';

  isAuthenticated$: Observable<boolean>;

  constructor(private userService: UserService) {
    this.isAuthenticated$ = this.userService.isAuthenticated;
  }
}
