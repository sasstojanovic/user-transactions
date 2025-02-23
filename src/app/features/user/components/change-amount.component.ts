import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';

import { UserService } from '../../../core/auth/services/user.service';
import { InfoDialogComponent } from '../../../shared/components/info-dialog.component';
import { User } from '../../../core/auth/user.model';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-change-amount',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './change-amount.component.html',
})
export class ChangeAmountComponent {
  destroyRef = inject(DestroyRef);
  errors: any = null;
  amountForm: FormGroup;
  isSubmitting = false;
  user: User | null = null;

  constructor(
    private userService: UserService,
    private dialogService: DialogService,
    public dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.user = this.config.data?.user || null;
    this.amountForm = new FormGroup({
      accountAmount: new FormControl(this.user?.accountAmount || 0, [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
      ]),
    });
  }

  get accountAmount() {
    return this.amountForm.get('accountAmount');
  }

  onChangeAmount() {
    if (this.amountForm.valid) {
      this.isSubmitting = true;
      this.errors = null;
      let userData: { userId: number; accountAmount: number } = {
        userId: this.user!.id ?? 0,
        accountAmount: parseFloat(this.amountForm.value.accountAmount),
      };
      this.userService
        .updateAmount(userData)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.openSuccessDialog();
          },
          error: (err) => {
            this.errors = err.error;
            this.isSubmitting = false;
          },
        });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  openSuccessDialog() {
    this.dialogRef.close();
    this.dialogRef = this.dialogService.open(InfoDialogComponent, {
      data: {
        message: 'The account amount has been successfully updated!',
      },
      header: 'Update amount',
      width: '400px',
      modal: true,
      dismissableMask: true,
    });
  }
}
