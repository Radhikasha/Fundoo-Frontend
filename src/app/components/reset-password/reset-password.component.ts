import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  passwordError: string = '';
  confirmError: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.errorMessage = 'Invalid or missing reset token. Please request a new reset link.';
      this.toastService.error(this.errorMessage);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onResetPassword(): void {
    this.passwordError = '';
    this.confirmError = '';
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.newPassword) {
      this.passwordError = 'New password is required.';
      return;
    }

    if (this.newPassword.length < 8) {
      this.passwordError = 'Password must be at least 8 characters.';
      return;
    }

    if (!this.confirmPassword) {
      this.confirmError = 'Please confirm your password.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.confirmError = 'Passwords do not match.';
      return;
    }

    this.isLoading = true;

    this.userService.resetPassword(this.token, this.newPassword).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.successMessage = response.message || 'Password reset successful! Redirecting to login...';
        this.toastService.success('Password reset successful!');
        setTimeout(() => {
          this.router.navigate(['/signin']);
        }, 2500);
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Reset password error:', err);
        if (typeof err.error === 'string') {
          this.errorMessage = err.error;
        } else if (err.error?.message) {
          this.errorMessage = err.error.message;
        } else if (err.message) {
          this.errorMessage = err.message;
        } else {
          this.errorMessage = 'Failed to reset password. The link may be expired.';
        }
        this.toastService.error(this.errorMessage);
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/signin']);
  }

  goToForgotPassword(): void {
    this.router.navigate(['/forgot']);
  }
}
