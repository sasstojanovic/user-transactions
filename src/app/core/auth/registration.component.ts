import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  catchError,
  debounceTime,
  first,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
  AsyncValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';

import { UserService } from './services/user.service';
import { User } from './user.model';
import { InfoDialogComponent } from '../../shared/components/info-dialog.component';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-registration',
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
  templateUrl: './registration.component.html',
})
export class RegistrationComponent {
  errors: any = null;
  registrationForm: FormGroup;
  isSubmitting = false;
  destroyRef = inject(DestroyRef);

  constructor(
    private userService: UserService,
    private dialogService: DialogService,
    public dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.registrationForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      surname: new FormControl('', [Validators.required]),
      email: new FormControl(
        '',
        [Validators.required, Validators.email],
        [this.emailExistsValidator()]
      ),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
        Validators.pattern('^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{5,}$'),
      ]),
      accountAmount: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
      ]),
    });
  }

  get name() {
    return this.registrationForm.get('name');
  }

  get surname() {
    return this.registrationForm.get('surname');
  }

  get email() {
    return this.registrationForm.get('email');
  }

  get password() {
    return this.registrationForm.get('password');
  }

  get accountAmount() {
    return this.registrationForm.get('accountAmount');
  }

  onSubmit() {
    if (this.registrationForm.valid) {
      this.isSubmitting = true;
      this.errors = null;

      let userData: User = {
        email: this.registrationForm.value.email,
        name: this.registrationForm.value.name,
        surname: this.registrationForm.value.surname,
        accountAmount: parseFloat(this.registrationForm.value.accountAmount),
        password: this.registrationForm.value.password,
      };

      this.userService
        .signup(userData)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.openSuccessDialog();
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

  openSuccessDialog() {
    this.dialogRef.close();
    this.dialogRef = this.dialogService.open(InfoDialogComponent, {
      data: {
        message: 'The account has been successfully created! Please Sign In!',
      },
      header: 'Sign Up',
      width: '400px',
      modal: true,
      dismissableMask: true,
    });
  }

  onCancel() {
    this.registrationForm.reset();
    this.dialogRef.close();
  }

  emailExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const email = control.value;

      if (!email) {
        return new Observable((observer) => observer.next(null));
      }

      return this.userService.checkUser(email).pipe(
        debounceTime(500),
        switchMap((exists) => (exists ? of({ emailExists: true }) : of(null))),
        catchError(() => of(null)),
        first()
      );
    };
  }
}
