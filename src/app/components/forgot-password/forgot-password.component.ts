import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  email: string = '';
  emailError: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  private emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  constructor(
    private router: Router,
    private userService: UserService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
  }

  onSendResetLink(): void {
    this.emailError = '';
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email) {
      this.emailError = 'Email is required.';
      return;
    }

    if (!this.emailPattern.test(this.email)) {
      this.emailError = 'Please enter a valid email address.';
      return;
    }

    this.isLoading = true;
    this.userService.forgotPassword(this.email).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.successMessage = response.message || 'A password reset link has been sent to your email.';
        this.toastService.success(this.successMessage);
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Something went wrong. Please try again.';
        this.toastService.error(this.errorMessage);
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/signin']);
  }
}
