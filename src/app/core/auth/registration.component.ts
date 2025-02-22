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
import { UserService } from './services/user.service';
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
import { User } from './user.model';
import { InfoDialogComponent } from '../../shared/components/info-dialog.component';
import {
  catchError,
  debounceTime,
  first,
  Observable,
  of,
  switchMap,
} from 'rxjs';

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
  styleUrl: './registration.component.scss',
  providers: [],
})
export class RegistrationComponent {
  errors: any = null;
  registrationForm: FormGroup;
  isSubmitting = false;
  destroyRef = inject(DestroyRef);

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private dialogService: DialogService
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

      this.userService
        .signup(this.registrationForm.value as User)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.ref.close();
            this.ref = this.dialogService.open(InfoDialogComponent, {
              data: {
                message: 'The account has been successfully created!',
              },
              header: 'Sign Up',
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
