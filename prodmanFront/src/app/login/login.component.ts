import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { finalize } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loginForm: FormGroup;
  registerForm: FormGroup;
  isLoginMode = true;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator.bind(this) });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    if (confirmPassword && confirmPassword.hasError('passwordMismatch') && password && confirmPassword.value === password.value) {
      confirmPassword.setErrors(null);
    }
    return null;
  }

  onSubmit(): void {
    if (this.isLoginMode) {
      this.onLogin();
    } else {
      this.onRegister();
    }
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;
      this.successMessage = null;

      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).pipe(
        finalize(() => {
          this.isLoading = false;
        })
      ).subscribe({
        next: () => {
          // Use setTimeout to ensure token is saved to localStorage before navigation
          // This is especially important for SSR or when localStorage operations might be async
          setTimeout(() => {
            if (this.authService.isAuthenticated()) {
              this.router.navigate(['/dashboard']);
            } else {
              this.errorMessage = 'Erro ao salvar autenticação. Tente novamente.';
            }
          }, 0);
        },
        error: (error: any) => {
          if (error.error?.message) {
            this.errorMessage = error.error.message;
          } else if (error.error?.error) {
            this.errorMessage = error.error.error;
          } else {
            this.errorMessage = 'Ocorreu um erro ao fazer login. Tente novamente.';
          }
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;
      this.successMessage = null;

      const { name, email, password } = this.registerForm.value;

      this.authService.register(name, email, password).pipe(
        finalize(() => {
          this.isLoading = false;
        })
      ).subscribe({
        next: () => {
          this.successMessage = 'Conta criada com sucesso! Você pode fazer login agora.';
          setTimeout(() => {
            this.isLoginMode = true;
            this.successMessage = null;
            this.registerForm.reset();
          }, 2000);
        },
        error: (error: any) => {
          if (error.error?.message) {
            this.errorMessage = error.error.message;
          } else if (error.error?.error) {
            this.errorMessage = error.error.error;
          } else {
            this.errorMessage = 'Ocorreu um erro ao criar a conta. Tente novamente.';
          }
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = null;
    this.successMessage = null;
    this.isLoading = false;
    this.loginForm.reset();
    this.registerForm.reset();
  }

  get email() {
    return this.isLoginMode ? this.loginForm.get('email') : this.registerForm.get('email');
  }

  get password() {
    return this.isLoginMode ? this.loginForm.get('password') : this.registerForm.get('password');
  }

  get name() {
    return this.registerForm.get('name');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  get currentForm() {
    return this.isLoginMode ? this.loginForm : this.registerForm;
  }
}

