import { Component, DestroyRef, inject } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { UserService } from './services/user.service';
import { Router } from '@angular/router';
import { Errors } from '../models/errors.model';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { RegistrationComponent } from './registration.component';
import { InfoDialogComponent } from '../../shared/components/info-dialog.component';

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
  styleUrl: './auth.component.scss',
  providers: [DialogService, MessageService],
})
export class AuthComponent {
  errors: any = null;
  isSubmitting = false;
  destroyRef = inject(DestroyRef);
  signInForm: FormGroup<SigninForm>;
  ref: DynamicDialogRef | undefined;

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
          error: (response) => {
            this.errors = response.error;
            console.log('Errors: ', response);
            this.isSubmitting = false;
          },
        });
    }
  }

  onSignUp() {
    this.ref = this.dialogService.open(RegistrationComponent, {
      header: 'Sign Up',
      width: '400px',
      modal: true,
      dismissableMask: true,
    });

    this.ref.onClose.subscribe(() => {
      console.log('CLOSE');
    });
  }
}
