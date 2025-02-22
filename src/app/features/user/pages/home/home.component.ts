import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../../core/auth/services/user.service';
import { User } from '../../../../core/auth/user.model';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  currentUser: User | null = null;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.currentUser.subscribe((user) => {
      this.currentUser = user;
      console.log(this.currentUser);
    });
  }
}
