import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router, private toastService: ToastService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let token = localStorage.getItem('token');
    if (token) {
      token = token.trim().replace(/^"|"$/g, '').replace(/^Bearer\s+/, '');
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('email');
          this.toastService.error('Session expired or unauthorized. Please sign in again.');
          const currentUrl = this.router.routerState.snapshot.url;
          const urlTree = this.router.parseUrl(currentUrl);
          this.router.navigate(['/signin'], { queryParams: urlTree.queryParams, replaceUrl: true });
        }
        return throwError(() => error);
      })
    );
  }
}
