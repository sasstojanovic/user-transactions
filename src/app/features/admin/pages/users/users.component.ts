import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserService } from '../../../../core/auth/services/user.service';
import { InfoDialogComponent } from '../../../../shared/components/info-dialog.component';
import { UserTransactionsComponent } from '../../components/user-transactions.component';
import { UsersTableComponent } from '../../components/users-table.component';
import { User } from '../../../../core/auth/user.model';

import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ButtonModule, UsersTableComponent],
  templateUrl: './users.component.html',
  providers: [DialogService, MessageService],
})
export class UsersComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  users: User[] = [];
  dialogRef: DynamicDialogRef | undefined;

  constructor(
    private userService: UserService,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    public messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.getUsers();
  }

  onDeleteUser(user: User) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete user: <br> <span class="text-emerald-400 font-semibold">${user.name} ${user.surname}</span>`,
      header: 'Delete User',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonStyleClass: 'p-button-text',
      rejectButtonProps: {
        label: 'No',
      },
      acceptButtonProps: {
        label: 'Yes',
      },
      accept: () => {
        this.deleteUser(user);
      },
    });
  }

  getUsers() {
    this.userService
      .getUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((users) => {
        this.users = users;
      });
  }

  deleteUser(user: User) {
    this.userService
      .deleteUser(user.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.getUsers();
          this.openSuccessDialog();
        },
        error: (err) => {
          // TODO: Catch errors
        },
      });
  }

  openSuccessDialog() {
    this.dialogRef = this.dialogService.open(InfoDialogComponent, {
      data: {
        message: `The user has been successfully deleted. `,
      },
      header: 'Delete User',
      width: '400px',
      modal: true,
      dismissableMask: true,
    });
  }

  onViewUser(user: User) {
    this.dialogRef = this.dialogService.open(UserTransactionsComponent, {
      header: `${user.name} ${user.surname}'s transactions`,
      width: '100%',
      modal: true,
      closable: true,
      dismissableMask: true,
      data: { user: user },
    });
  }
}
