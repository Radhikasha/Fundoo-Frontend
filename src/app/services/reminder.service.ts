import { Injectable } from '@angular/core';
import { ToastService } from './toast.service';

/**
 * ReminderService — notification & display layer.
 *
 * Reminders are now stored in the backend (PostgreSQL via Spring Boot).
 * This service:
 *  - formats reminder timestamps for display
 *  - polls the in-memory notes array every 30s for due reminders
 *  - fires browser Notification + toast when a reminder is due
 *
 * It does NOT store anything in localStorage.
 */
@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  private pollingInterval: any = null;
  /** Tracks noteIds that already fired this session so we don't double-notify */
  private firedSet: Set<number> = new Set();

  constructor(private toastService: ToastService) {}

  // ── Polling ──────────────────────────────────────────────────────

  /**
   * Start polling the provided notes getter every 30 seconds.
   * @param getNotes  A function returning the current notes array.
   * @param onFired   Called with the noteId when a reminder fires (so the dashboard can clear it).
   */
  startPolling(getNotes: () => any[], onFired?: (noteId: number) => void): void {
    if (this.pollingInterval) return;
    this.requestNotificationPermission();

    // Check immediately on startup
    this.checkReminders(getNotes(), onFired);

    this.pollingInterval = setInterval(() => {
      this.checkReminders(getNotes(), onFired);
    }, 10_000); // Poll every 10 seconds for timely notifications
  }

  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  private checkReminders(notes: any[], onFired?: (noteId: number) => void): void {
    const now = new Date();
    notes.forEach(note => {
      if (!note.reminder || this.firedSet.has(note.id)) return;
      const reminderDate = new Date(note.reminder);
      if (now >= reminderDate) {
        this.firedSet.add(note.id);
        this.fireNotification(note);
        if (onFired) onFired(note.id);
      }
    });
  }

  private fireNotification(note: any): void {
    const title = note.title || 'Fundoo Note';
    const body = note.title
      ? `Reminder: "${note.title}"`
      : 'You have a note reminder!';

    this.toastService.info(`🔔 ${body}`);

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Fundoo Notes', {
        body,
        icon: '/favicon.ico'
      });
    }
  }

  private requestNotificationPermission(): void {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  // ── Display helpers ──────────────────────────────────────────────

  /**
   * Format a reminder timestamp for display on note cards.
   * Handles both "2026-07-28T08:00:00" (backend) and full ISO strings.
   */
  formatReminderDisplay(isoString: string): string {
    if (!isoString) return '';
    // Backend returns LocalDateTime as "2026-07-28T08:00:00" (local time, no Z).
    // Parse as local time by replacing the separator (works cross-browser).
    const date = this.parseLocalDateTime(isoString);
    const now = new Date();
    const isOverdue = date < now;

    const formatted = date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    return isOverdue ? `${formatted} (overdue)` : formatted;
  }

  isOverdue(isoString: string): boolean {
    if (!isoString) return false;
    return this.parseLocalDateTime(isoString) < new Date();
  }

  /**
   * Convert a backend LocalDateTime string to a JS Date.
   * Handles both "2026-07-28T08:00:00" and full ISO "2026-07-28T08:00:00.000Z".
   */
  private parseLocalDateTime(isoString: string): Date {
    // If it already has a Z or offset, parse directly
    if (isoString.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(isoString)) {
      return new Date(isoString);
    }
    // Backend LocalDateTime — treat as local time
    return new Date(isoString);
  }
}
