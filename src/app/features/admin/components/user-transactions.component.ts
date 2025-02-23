import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

import { TransactionsService } from '../../user/services/transactions.service';
import { Transaction } from '../../user/models/transaction.model';
import { User } from '../../../core/auth/user.model';

import { InfoDialogComponent } from '../../../shared/components/info-dialog.component';
import { EditTransactionComponent } from '../../user/components/edit-transaction.component';
import { TransactionsTableComponent } from '../../user/components/transactions-table.component';

import { MessageModule } from 'primeng/message';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-users-transactions',
  standalone: true,
  imports: [
    CommonModule,
    TransactionsTableComponent,
    DialogModule,
    ButtonModule,
    MessageModule,
  ],
  templateUrl: './user-transactions.component.html',
  providers: [DialogService, MessageService],
})
export class UserTransactionsComponent {
  transactions$: Observable<Transaction[]> = new Observable();
  destroyRef = inject(DestroyRef);
  user: User | null = null;

  constructor(
    public dialogRef: DynamicDialogRef,
    public dialogConfig: DynamicDialogConfig,
    public transactionsService: TransactionsService,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService
  ) {
    this.transactions$ = this.transactionsService.transactions$;
    this.user = this.dialogConfig.data?.user || null;

    if (this.user && this.user.id) {
      this.transactionsService.loadTransactions(this.user.id);
    }
  }

  onDelete(transaction: Transaction) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete transaction: <br> <span class="text-emerald-400 font-semibold">${transaction.itemPurchased}</span>`,
      header: 'Delete Transaction',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonStyleClass: 'p-button-text',
      rejectButtonProps: {
        label: 'No',
      },
      acceptButtonProps: {
        label: 'Yes',
      },
      accept: () => {
        this.confirmationService.close();
        this.deleteTransaction(transaction);
      },
      reject: () => {
        this.confirmationService.close();
      },
    });
  }

  deleteTransaction(transaction: Transaction) {
    this.transactionsService
      .deleteTransaction(transaction.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.dialogRef = this.dialogService.open(InfoDialogComponent, {
            data: {
              message: `The transaction has been successfully deleted. `,
            },
            header: 'Delete Transaction',
            width: '400px',
            modal: true,
            dismissableMask: true,
          });
        },
        error: (err) => {
          // TODO: Catch errors
        },
      });
  }

  onEdit(transaction: Transaction) {
    this.dialogRef = this.dialogService.open(EditTransactionComponent, {
      header: 'Edit Transaction',
      width: '400px',
      modal: true,
      dismissableMask: true,
      data: { user: this.user, transaction: transaction, isExternal: true },
    });
  }

  onCancel() {
    this.dialogRef.close();
  }
}
