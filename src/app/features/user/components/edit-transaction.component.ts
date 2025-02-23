import { Component, DestroyRef, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, switchMap, catchError, first } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  AsyncValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';

import { TransactionsService } from '../services/transactions.service';
import { UserService } from '../../../core/auth/services/user.service';
import { InfoDialogComponent } from '../../../shared/components/info-dialog.component';

import { Transaction } from '../models/transaction.model';
import { User } from '../../../core/auth/user.model';

import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-edit-transaction',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    MessageModule,
    CommonModule,
    ProgressSpinnerModule,
    DatePickerModule,
  ],
  templateUrl: './edit-transaction.component.html',
})
export class EditTransactionComponent {
  errors: any = null;
  isSubmitting = false;
  transactionForm: FormGroup;
  user: User | null = null;
  transaction: Transaction | null = null;
  isExternal: boolean = false;
  destroyRef = inject(DestroyRef);

  constructor(
    public dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private dialogService: DialogService,
    private transactionsService: TransactionsService,
    private userService: UserService
  ) {
    this.user = this.config.data?.user || null;
    this.transaction = this.config.data?.transaction || null;
    this.isExternal = this.config.data?.isExternal || false;

    this.transactionForm = new FormGroup({
      itemPurchased: new FormControl(this.transaction?.itemPurchased || '', [
        Validators.required,
      ]),
      itemCategory: new FormControl(this.transaction?.itemCategory || '', [
        Validators.required,
      ]),
      dateOfPurchase: new FormControl(
        this.transaction?.dateOfPurchase
          ? new Date(this.transaction.dateOfPurchase)
          : '',
        [Validators.required]
      ),
      amountSpent: new FormControl(
        this.transaction?.amountSpent || '',
        [Validators.required, Validators.pattern('^[0-9]*$')],
        [this.amountSpentValidator()]
      ),
    });
  }

  get itemPurchased() {
    return this.transactionForm.get('itemPurchased');
  }

  get itemCategory() {
    return this.transactionForm.get('itemCategory');
  }

  get dateOfPurchase() {
    return this.transactionForm.get('dateOfPurchase');
  }

  get amountSpent() {
    return this.transactionForm.get('amountSpent');
  }

  amountSpentValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (this.user && this.user.id) {
        return this.userService.getUserAmount(this.user.id).pipe(
          debounceTime(500),
          switchMap((accountAmount) => {
            if (this.transaction) {
              let newUserAmount = 0;
              let difference =
                parseFloat(this.amountSpent?.value) -
                this.transaction?.amountSpent;
              newUserAmount = accountAmount - difference;

              return newUserAmount >= 0 ? of(null) : of({ amountSpent: true });
            } else {
              let remainingAmount = 0;
              remainingAmount = accountAmount - this.amountSpent?.value;
              return remainingAmount >= 0
                ? of(null)
                : of({ amountSpent: true });
            }
          }),
          catchError(() => of(null)),
          first()
        );
      } else {
        return new Observable((observer) => observer.next(null));
      }
    };
  }

  onSubmit() {
    if (this.transactionForm.valid) {
      this.isSubmitting = true;
      this.errors = null;
      let transactionData = {
        itemPurchased: this.transactionForm.value.itemPurchased,
        itemCategory: this.transactionForm.value.itemCategory,
        dateOfPurchase: this.transactionForm.value.dateOfPurchase,
        amountSpent: parseFloat(this.transactionForm.value.amountSpent),
        userId: this.user?.id,
      };

      if (this.transaction) {
        let newUserAmount: number = 0;

        if (
          this.transaction.amountSpent &&
          (this.user?.accountAmount || this.user?.accountAmount === 0)
        ) {
          let difference =
            parseFloat(this.transactionForm.value.amountSpent) -
            this.transaction?.amountSpent;
          newUserAmount = this.user?.accountAmount - difference;
        }

        // Edit transaction
        this.transactionsService
          .updateTransaction(
            { ...transactionData, id: this.transaction?.id } as Transaction,
            this.user,
            newUserAmount,
            this.isExternal
          )
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.openSuccessDialog(
                'The transaction has been successfully updated!',
                'Update Transaction'
              );
            },
            error: (err) => {
              this.isSubmitting = false;
              this.errors = err.error;
            },
            complete: () => {
              this.isSubmitting = false;
            },
          });
      } else {
        // New transaction
        this.transactionsService
          .addTransaction(transactionData as Transaction, this.user)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.openSuccessDialog(
                'The transaction has been successfully created!',
                'Add Transaction'
              );
            },
            error: (err) => {
              this.isSubmitting = false;
              this.errors = err.error;
            },
            complete: () => {
              this.isSubmitting = false;
            },
          });
      }
    }
  }

  onCancel() {
    this.transactionForm.reset();
    this.dialogRef.close();
  }

  openSuccessDialog(message: string, header: string) {
    this.dialogRef.close();
    this.dialogRef = this.dialogService.open(InfoDialogComponent, {
      data: {
        message: message,
      },
      header: header,
      width: '400px',
      modal: true,
      dismissableMask: true,
    });
  }
}
