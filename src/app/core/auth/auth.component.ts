import { Component, DestroyRef, inject } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

import { UserService } from './services/user.service';
import { RegistrationComponent } from './registration.component';

import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

interface SigninForm {
  email: FormControl<string | null>;
  password: FormControl<string | null>;
}

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    ButtonModule,
    InputTextModule,
    ProgressSpinnerModule,
    ReactiveFormsModule,
    NgIf,
    NgClass,
  ],
  templateUrl: './auth.component.html',
  providers: [DialogService, MessageService],
})
export class AuthComponent {
  errors: any = null;
  isSubmitting = false;
  destroyRef = inject(DestroyRef);
  signInForm: FormGroup<SigninForm>;
  dialogRef: DynamicDialogRef | undefined;

  constructor(
    private userService: UserService,
    private router: Router,
    private dialogService: DialogService,
    public messageService: MessageService
  ) {
    this.signInForm = new FormGroup<SigninForm>({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
    });
  }

  get email() {
    return this.signInForm.get('email');
  }

  get password() {
    return this.signInForm.get('password');
  }

  onSignIn() {
    this.isSubmitting = true;
    this.errors = null;

    if (this.signInForm.valid) {
      this.userService
        .signin(this.signInForm.value as { email: string; password: string })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.router.navigate(['/']);
          },
          error: (err) => {
            this.errors = err.error;
            this.isSubmitting = false;
          },
        });
    }
  }

  onSignUp() {
    this.dialogRef = this.dialogService.open(RegistrationComponent, {
      header: 'Sign Up',
      width: '400px',
      modal: true,
      dismissableMask: true,
    });
  }
}
