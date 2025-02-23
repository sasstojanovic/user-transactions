import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

import { UserService } from '../../../core/auth/services/user.service';
import { Transaction } from '../models/transaction.model';
import { User } from '../../../core/auth/user.model';

@Injectable({
  providedIn: 'root',
})
export class TransactionsService {
  private apiUrl = environment.apiUrl;
  private transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  transactions$ = this.transactionsSubject
    .asObservable()
    .pipe(distinctUntilChanged());

  constructor(
    private http: HttpClient,
    private userService: UserService
  ) {}

  loadTransactions(userId: number) {
    this.http
      .get<Transaction[]>(`${this.apiUrl}/transactions?userId=${userId}`)
      .subscribe((transactions) => {
        this.transactionsSubject.next(transactions);
      });
  }

  addTransaction(
    transaction: Transaction,
    user: User | null
  ): Observable<Transaction> {
    return this.http
      .post<Transaction>(`${this.apiUrl}/transactions`, transaction)
      .pipe(
        switchMap((newTransaction) => {
          if (!user?.id || user.accountAmount === undefined) {
            return throwError(() => new Error('Invalid user data'));
          }
          const updatedAmount = user.accountAmount - transaction.amountSpent;

          return this.userService
            .updateAmount({ userId: user.id, accountAmount: updatedAmount })
            .pipe(map(() => newTransaction));
        }),
        tap((newTransaction) => {
          const transactions = [
            ...this.transactionsSubject.value,
            newTransaction,
          ];
          this.transactionsSubject.next(transactions);
        })
      );
  }

  updateTransaction(
    transaction: Transaction,
    user: User | null
  ): Observable<Transaction> {
    return this.http
      .patch<Transaction>(
        `${this.apiUrl}/transactions/${transaction.id}`,
        transaction
      )
      .pipe(
        switchMap((newTransaction) => {
          if (!user?.id || user.accountAmount === undefined) {
            return throwError(() => new Error('Invalid user data'));
          }

          return this.userService
            .updateAmount({
              userId: user.id,
              accountAmount: user.accountAmount,
            })
            .pipe(map(() => newTransaction));
        }),
        tap((updatedTransaction) => {
          const transactions = this.transactionsSubject.value.map((t) =>
            t.id === updatedTransaction.id ? updatedTransaction : t
          );

          this.transactionsSubject.next(transactions);
        })
      );
  }

  deleteTransaction(transactionId: number | undefined): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/transactions/${transactionId}`)
      .pipe(
        tap(() => {
          const transactions = this.transactionsSubject.value.filter(
            (transaction) => transaction.id !== transactionId
          );
          this.transactionsSubject.next(transactions);
        })
      );
  }
}
