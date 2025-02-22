import { Component, DestroyRef, inject } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
  AsyncValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { UserService } from '../../../core/auth/services/user.service';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { User } from '../../../core/auth/user.model';
import { InfoDialogComponent } from '../../../shared/components/info-dialog.component';

import {
  catchError,
  debounceTime,
  first,
  Observable,
  of,
  switchMap,
} from 'rxjs';

@Component({
  selector: 'app-change-amount',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    MessageModule,
    CommonModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './change-amount.component.html',
  styleUrl: './change-amount.component.scss',
})
export class ChangeAmountComponent {
  errors: any = null;
  amountForm: FormGroup;
  isSubmitting = false;
  destroyRef = inject(DestroyRef);
  user: User | null = null;

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private dialogService: DialogService
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
        userId: this.user!.id,
        accountAmount: Number(this.amountForm.value.accountAmount),
      };
      this.userService
        .updateAmount(userData)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response) => {
            console.log('Response: ', response);
            this.ref.close();
            this.ref = this.dialogService.open(InfoDialogComponent, {
              data: {
                message: 'The account amount has been successfully updated!',
              },
              header: 'Update amount',
              width: '400px',
              modal: true,
              dismissableMask: true,
            });
          },
          error: (response) => {
            this.errors = response.error;
            console.log('Errors: ', response);
            this.isSubmitting = false;
          },
        });
    }
  }

  onCancel() {
    this.ref.close();
  }
}
