import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

import { TransactionsService } from '../../services/transactions.service';
import { UserService } from '../../../../core/auth/services/user.service';

import { TransactionsTableComponent } from '../../components/transactions-table.component';
import { EditTransactionComponent } from '../../components/edit-transaction.component';
import { InfoDialogComponent } from '../../../../shared/components/info-dialog.component';

import { User } from '../../../../core/auth/user.model';
import { Transaction } from '../../models/transaction.model';

import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, ButtonModule, TransactionsTableComponent],
  templateUrl: './transactions.component.html',
  providers: [DialogService, MessageService],
})
export class TransactionsComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private currentUserSubscription!: Subscription;
  transactions$: Observable<Transaction[]> = new Observable();
  currentUser: User | null = null;
  ref: DynamicDialogRef | undefined;

  constructor(
    private transactionsService: TransactionsService,
    private userService: UserService,
    private dialogService: DialogService,
    public messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.transactions$ = this.transactionsService.transactions$;

    this.currentUserSubscription = this.userService.currentUser.subscribe(
      (user) => {
        if (user) {
          this.currentUser = user;
          this.transactionsService.loadTransactions(user.id);
        }
      }
    );

    this.destroyRef.onDestroy(() => {
      this.currentUserSubscription.unsubscribe();
    });
  }

  onAddTransaction() {
    this.ref = this.dialogService.open(EditTransactionComponent, {
      header: 'Add Transaction',
      width: '400px',
      modal: true,
      dismissableMask: true,
      data: { user: this.currentUser },
    });
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
        this.deleteTransaction(transaction);
      },
    });
  }

  deleteTransaction(transaction: Transaction) {
    this.transactionsService.deleteTransaction(transaction.id).subscribe({
      next: () => {
        this.ref = this.dialogService.open(InfoDialogComponent, {
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
    this.ref = this.dialogService.open(EditTransactionComponent, {
      header: 'Edit Transaction',
      width: '400px',
      modal: true,
      dismissableMask: true,
      data: { user: this.currentUser, transaction: transaction },
    });
  }
}
