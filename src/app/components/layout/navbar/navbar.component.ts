import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  @Input() activeHeaderTitle: string = 'Fundoo Notes';
  @Input() activeSection: string = 'notes';
  @Input() searchQuery: string = '';
  @Input() isGridView: boolean = true;
  @Input() userEmail: string = '';

  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() toggleLayout = new EventEmitter<void>();
  @Output() signOut = new EventEmitter<void>();
  @Output() refresh = new EventEmitter<void>();

  showProfileMenu = false;
  showMoreAccounts = true;
  isRefreshing = false;

  constructor(private router: Router) {}

  onRefresh(): void {
    if (this.isRefreshing) return;
    this.isRefreshing = true;
    this.refresh.emit();
    setTimeout(() => {
      this.isRefreshing = false;
    }, 600);
  }

  onSearchChange(value: string): void {
    this.searchQueryChange.emit(value);
  }

  clearSearch(): void {
    this.searchQueryChange.emit('');
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }

  toggleMoreAccounts(): void {
    this.showMoreAccounts = !this.showMoreAccounts;
  }

  onAddAccount(): void {
    this.showProfileMenu = false;
    this.router.navigate(['/signup']);
  }

  onSignOut(): void {
    this.showProfileMenu = false;
    this.signOut.emit();
  }

  get userInitial(): string {
    if (!this.userEmail) return 'U';
    return this.userEmail.charAt(0).toUpperCase();
  }

  get firstName(): string {
    if (!this.userEmail) return 'User';
    const namePart = this.userEmail.split('@')[0];
    const cleanName = namePart.split('.')[0].replace(/[0-9]/g, '');
    if (!cleanName) return 'User';
    return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  }
}
