import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

export interface QuickOption {
  label: string;
  sublabel: string;
  icon: string;
  isoTime: string;
}

@Component({
  selector: 'app-reminder-picker',
  templateUrl: './reminder-picker.component.html',
  styleUrls: ['./reminder-picker.component.css']
})
export class ReminderPickerComponent implements OnInit {
  @Input() currentReminder: string | null = null;
  @Input() directionUp = false;

  @Output() reminderSet = new EventEmitter<string>();
  @Output() reminderRemoved = new EventEmitter<void>();
  @Output() pickerClose = new EventEmitter<void>();

  quickOptions: QuickOption[] = [];

  customDate = '';
  customTime = '';
  showCustom = false;

  ngOnInit(): void {
    this.buildQuickOptions();
    if (this.currentReminder) {
      const d = new Date(this.currentReminder);
      this.customDate = this.formatDateInput(d);
      this.customTime = this.formatTimeInput(d);
    } else {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 60);
      this.customDate = this.formatDateInput(now);
      this.customTime = this.formatTimeInput(now);
    }
  }

  buildQuickOptions(): void {
    const now = new Date();

    // Later today: +3 hours, but min 18:00
    const laterToday = new Date(now);
    laterToday.setHours(laterToday.getHours() + 3, 0, 0, 0);
    const eveningToday = new Date(now);
    eveningToday.setHours(18, 0, 0, 0);
    const laterTodayDate = laterToday > eveningToday ? laterToday : eveningToday;

    // Tomorrow morning: 8 AM
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);

    // Next week: Monday 8 AM
    const nextWeek = new Date(now);
    const day = nextWeek.getDay();
    const daysUntilMonday = day === 0 ? 1 : 8 - day;
    nextWeek.setDate(nextWeek.getDate() + daysUntilMonday);
    nextWeek.setHours(8, 0, 0, 0);

    this.quickOptions = [
      {
        label: 'Later today',
        sublabel: this.formatDisplay(laterTodayDate),
        icon: 'schedule',
        isoTime: this.toLocalISOString(laterTodayDate)
      },
      {
        label: 'Tomorrow',
        sublabel: this.formatDisplay(tomorrow),
        icon: 'wb_sunny',
        isoTime: this.toLocalISOString(tomorrow)
      },
      {
        label: 'Next week',
        sublabel: this.formatDisplay(nextWeek),
        icon: 'next_week',
        isoTime: this.toLocalISOString(nextWeek)
      }
    ];
  }

  selectQuickOption(option: QuickOption): void {
    this.reminderSet.emit(option.isoTime);
  }

  toggleCustom(event: Event): void {
    event.stopPropagation();
    this.showCustom = !this.showCustom;
  }

  saveCustom(event: Event): void {
    event.stopPropagation();
    if (!this.customDate || !this.customTime) return;
    // Parse as local time — do NOT call toISOString() (that converts to UTC)
    const localISO = `${this.customDate}T${this.customTime}:00`;
    this.reminderSet.emit(localISO);
  }

  onRemove(event: Event): void {
    event.stopPropagation();
    this.reminderRemoved.emit();
  }

  stopProp(event: Event): void {
    event.stopPropagation();
  }

  private formatDisplay(date: Date): string {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  private formatDateInput(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private formatTimeInput(date: Date): string {
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${min}`;
  }

  /**
   * Convert a JS Date to a LOCAL-time ISO string (no Z, no timezone offset).
   * Example: IST 22:54 → "2026-07-27T22:54:00"
   * This is what the Java backend's LocalDateTime expects.
   */
  private toLocalISOString(date: Date): string {
    const y = date.getFullYear();
    const mo = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const mi = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return `${y}-${mo}-${d}T${h}:${mi}:${s}`;
  }
}
