import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'fundoo-app';

  constructor(private router: Router) {}

  ngOnInit(): void {
    window.addEventListener('pageshow', this.checkAuthOnBfCache);
    window.addEventListener('popstate', this.checkAuthOnBfCache);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if (event.urlAfterRedirects && event.urlAfterRedirects.includes('/dashboard')) {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/signin';
        }
      }
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('pageshow', this.checkAuthOnBfCache);
    window.removeEventListener('popstate', this.checkAuthOnBfCache);
  }

  private checkAuthOnBfCache = (event: Event): void => {
    const currentUrl = window.location.pathname;
    if (currentUrl.includes('/dashboard')) {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/signin';
      }
    }
  };
}
