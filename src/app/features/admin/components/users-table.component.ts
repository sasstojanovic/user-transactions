import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { User } from '../../../core/auth/user.model';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-users-table',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule],
  templateUrl: './users-table.component.html',
})
export class UsersTableComponent {
  @Input() users: User[] = [];
  @Output() deleteUser = new EventEmitter<User>();
  @Output() viewUser = new EventEmitter<User>();

  onDelete(user: User) {
    this.deleteUser.emit(user);
  }

  onView(user: User) {
    this.viewUser.emit(user);
  }
}
