import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Transaction } from '../models/transaction.model';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-transactions-table',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule],
  templateUrl: './transactions-table.component.html',
})
export class TransactionsTableComponent {
  @Input() transactions: Transaction[] | null = [];
  @Output() editTransaction = new EventEmitter<Transaction>();
  @Output() deleteTransaction = new EventEmitter<Transaction>();

  onEdit(transaction: Transaction) {
    this.editTransaction.emit(transaction);
  }

  onDelete(transaction: Transaction) {
    this.deleteTransaction.emit(transaction);
  }
}
