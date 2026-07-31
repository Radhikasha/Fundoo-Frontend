import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  showPassword: boolean = false;
  firstNameError: string = '';
  lastNameError: string = '';
  emailError: string = '';
  passwordError: string = '';
  confirmPasswordError: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  private namePattern = /^[a-zA-Z ]+$/;
  private emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  private passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  constructor(
    private router: Router,
    private userService: UserService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
  }

  onSubmit(): void {
    this.clearErrors();

    if (!this.firstName) {
      this.firstNameError = 'First name is required.';
    } else if (!this.namePattern.test(this.firstName)) {
      this.firstNameError = 'First name can only contain letters and spaces.';
    }

    if (!this.lastName) {
      this.lastNameError = 'Last name is required.';
    } else if (!this.namePattern.test(this.lastName)) {
      this.lastNameError = 'Last name can only contain letters and spaces.';
    }

    if (!this.email) {
      this.emailError = 'Email is required.';
    } else if (!this.emailPattern.test(this.email)) {
      this.emailError = 'Please enter a valid email address.';
    }

    if (!this.password) {
      this.passwordError = 'Password is required.';
    } else if (!this.passwordPattern.test(this.password)) {
      this.passwordError = 'Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.';
    }

    if (!this.confirmPassword) {
      this.confirmPasswordError = 'Please confirm your password.';
    } else if (this.password !== this.confirmPassword) {
      this.confirmPasswordError = 'Passwords do not match.';
    }

    if (this.firstNameError || this.lastNameError || this.emailError || this.passwordError || this.confirmPasswordError) {
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;
    
    const userDTO = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password
    };

    this.userService.register(userDTO).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        console.log('Registration success:', response);
        this.toastService.success('Registration successful! Please sign in.');
        this.router.navigate(['/signin'], { queryParams: { registered: 'true' } });
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Registration failed:', err);
        this.errorMessage = this.getErrorMessage(err);
        this.toastService.error(this.errorMessage);
      }
    });
  }

  private getErrorMessage(err: any): string {
    if (err && err.error) {
      if (typeof err.error === 'string') {
        try {
          const parsed = JSON.parse(err.error);
          return parsed.message || err.error;
        } catch {
          return err.error;
        }
      }
      if (err.error.message) {
        return err.error.message;
      }
      if (typeof err.error === 'object') {
        const values = Object.values(err.error).filter(val => typeof val === 'string');
        if (values.length > 0) {
          return values.join(' ');
        }
      }
    }
    return err?.message || 'Registration failed. Backend server might be offline.';
  }

  clearErrors(): void {
    this.firstNameError = '';
    this.lastNameError = '';
    this.emailError = '';
    this.passwordError = '';
    this.confirmPasswordError = '';
    this.errorMessage = '';
  }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  goToSignIn(): void {
    this.router.navigate(['/signin']);
  }
}
