import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {
  email = '';
  password = '';
  emailError = '';
  passwordError = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  private emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    if (this.route.snapshot.queryParams['registered'] === 'true') {
      this.toastService.success('Registration successful! Please sign in.');
    }
  }

  onSignIn(): void {
    this.emailError = '';
    this.passwordError = '';
    this.errorMessage = '';

    if (!this.email) {
      this.emailError = 'Email is required.';
    } else if (!this.emailPattern.test(this.email)) {
      this.emailError = 'Please enter a valid email address.';
    }

    if (!this.password) {
      this.passwordError = 'Password is required.';
    }

    if (this.emailError || this.passwordError) return;

    this.isLoading = true;

    this.userService.login({ email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        let token = typeof res === 'string' ? res : (res.data?.token || res.data || res.token);
        if (typeof token === 'string') {
          token = token.trim().replace(/^"|"$/g, '').replace(/^Bearer\s+/, '');
        }
        if (token) {
          localStorage.setItem('token', token);
        }
        localStorage.setItem('email', res?.data?.email || this.email);
        this.toastService.success('Login successful!');
        this.router.navigate(['/dashboard'], { queryParams: this.route.snapshot.queryParams, replaceUrl: true });
      },
      error: (err: any) => {
        this.isLoading = false;
        let msg = 'Invalid email or password.';
        if (typeof err.error === 'string') {
          try {
            const parsed = JSON.parse(err.error);
            msg = parsed.message || err.error;
          } catch {
            msg = err.error;
          }
        } else if (err.error?.message) {
          msg = err.error.message;
        }
        this.errorMessage = msg;
        this.toastService.error(this.errorMessage);
      }
    });
  }

  goToSignUp(): void {
    this.router.navigate(['/signup']);
  }

  goToForgotPassword(): void {
    this.router.navigate(['/forgot']);
  }
}
