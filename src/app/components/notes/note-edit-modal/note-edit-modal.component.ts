import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { Note, Label } from '../../dashboard/dashboard.component';
import { ColorOption } from '../../shared/color-picker/color-picker.component';
import { ReminderService } from '../../../services/reminder.service';

@Component({
  selector: 'app-note-edit-modal',
  templateUrl: './note-edit-modal.component.html',
  styleUrls: ['./note-edit-modal.component.css']
})
export class NoteEditModalComponent implements OnChanges {
  @ViewChild('contentTextarea') contentTextarea?: ElementRef<HTMLTextAreaElement>;

  @Input() editingNote: Note | null = null;
  @Input() labels: Label[] = [];
  @Input() colors: ColorOption[] = [];

  @Output() close = new EventEmitter<{ note: Note; title: string; content: string }>();
  @Output() setColor = new EventEmitter<{ note: Note; color: string; event?: Event }>();
  @Output() toggleLabel = new EventEmitter<{ note: Note; label: Label; event?: Event }>();
  @Output() removeLabel = new EventEmitter<{ note: Note; labelId: number; event?: Event }>();
  @Output() createLabel = new EventEmitter<{ note: Note; name: string }>();
  @Output() openCollaborator = new EventEmitter<{ note: Note; event: Event }>();
  @Output() setReminder = new EventEmitter<{ note: Note; reminderTime: string }>();
  @Output() removeReminder = new EventEmitter<{ note: Note }>();

  editTitle = '';
  editContent = '';

  showColorPicker = false;
  showLabelMenu = false;
  showReminderPicker = false;

  constructor(public reminderService: ReminderService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editingNote'] && this.editingNote) {
      this.editTitle = this.editingNote.title || '';
      this.editContent = this.editingNote.content || '';
      setTimeout(() => this.autoResize(), 0);
    }
  }

  autoResize(event?: Event): void {
    const textarea = event ? (event.target as HTMLTextAreaElement) : this.contentTextarea?.nativeElement;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }

  onClose(): void {
    if (this.editingNote) {
      this.close.emit({
        note: this.editingNote,
        title: this.editTitle,
        content: this.editContent
      });
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.onClose();
    }
  }

  toggleColorPicker(event: Event): void {
    event.stopPropagation();
    this.showColorPicker = !this.showColorPicker;
    this.showLabelMenu = false;
  }

  onSelectColor(color: string): void {
    if (this.editingNote) {
      this.setColor.emit({ note: this.editingNote, color });
    }
    this.showColorPicker = false;
  }

  toggleLabelMenu(event: Event): void {
    event.stopPropagation();
    this.showLabelMenu = !this.showLabelMenu;
    this.showColorPicker = false;
  }

  onToggleLabel(label: Label): void {
    if (this.editingNote) {
      this.toggleLabel.emit({ note: this.editingNote, label });
    }
  }

  onRemoveLabel(labelId: number, event: Event): void {
    event.stopPropagation();
    if (this.editingNote) {
      this.removeLabel.emit({ note: this.editingNote, labelId, event });
    }
  }

  onCreateLabel(name: string): void {
    if (this.editingNote) {
      this.createLabel.emit({ note: this.editingNote, name });
    }
  }

  onOpenCollaborator(event: Event): void {
    event.stopPropagation();
    if (this.editingNote) {
      this.openCollaborator.emit({ note: this.editingNote, event });
    }
  }

  toggleReminderPicker(event: Event): void {
    event.stopPropagation();
    this.showReminderPicker = !this.showReminderPicker;
    this.showColorPicker = false;
    this.showLabelMenu = false;
  }

  onSetReminder(reminderTime: string): void {
    if (this.editingNote) {
      this.setReminder.emit({ note: this.editingNote, reminderTime });
    }
    this.showReminderPicker = false;
  }

  onRemoveReminder(): void {
    if (this.editingNote) {
      this.removeReminder.emit({ note: this.editingNote });
    }
    this.showReminderPicker = false;
  }

  getInitial(email: string): string {
    return email ? email.charAt(0).toUpperCase() : 'P';
  }
}

