import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Note, Label } from '../../dashboard/dashboard.component';
import { ColorOption } from '../../shared/color-picker/color-picker.component';
import { ReminderService } from '../../../services/reminder.service';

@Component({
  selector: 'app-note-card',
  templateUrl: './note-card.component.html',
  styleUrls: ['./note-card.component.css']
})
export class NoteCardComponent {
  @Input() note!: Note;
  @Input() activeSection: string = 'notes';
  @Input() labels: Label[] = [];
  @Input() colors: ColorOption[] = [];

  constructor(public reminderService: ReminderService) {}

  @Output() cardClick = new EventEmitter<Note>();
  @Output() togglePin = new EventEmitter<{ note: Note; event: Event }>();
  @Output() archiveNote = new EventEmitter<{ note: Note; event: Event }>();
  @Output() unarchiveNote = new EventEmitter<{ note: Note; event: Event }>();
  @Output() setColor = new EventEmitter<{ note: Note; color: string; event?: Event }>();
  @Output() toggleLabel = new EventEmitter<{ note: Note; label: Label; event?: Event }>();
  @Output() removeLabel = new EventEmitter<{ note: Note; labelId: number; event: Event }>();
  @Output() createLabel = new EventEmitter<{ note: Note; name: string }>();
  @Output() openCollaborator = new EventEmitter<{ note: Note; event: Event }>();
  @Output() trashNote = new EventEmitter<{ note: Note; event: Event }>();
  @Output() restoreNote = new EventEmitter<{ note: Note; event: Event }>();
  @Output() deleteForever = new EventEmitter<{ note: Note; event: Event }>();
  @Output() setReminder = new EventEmitter<{ note: Note; reminderTime: string }>();
  @Output() removeReminder = new EventEmitter<{ note: Note }>();

  showColorPicker = false;
  showLabelMenu = false;
  showReminderPicker = false;

  onCardClick(): void {
    if (this.activeSection !== 'trash') {
      this.cardClick.emit(this.note);
    }
  }

  onTogglePin(event: Event): void {
    event.stopPropagation();
    this.togglePin.emit({ note: this.note, event });
  }

  onArchive(event: Event): void {
    event.stopPropagation();
    this.archiveNote.emit({ note: this.note, event });
  }

  onUnarchive(event: Event): void {
    event.stopPropagation();
    this.unarchiveNote.emit({ note: this.note, event });
  }

  toggleColorPicker(event: Event): void {
    event.stopPropagation();
    this.showColorPicker = !this.showColorPicker;
    this.showLabelMenu = false;
  }

  onSelectColor(color: string): void {
    this.setColor.emit({ note: this.note, color });
    this.showColorPicker = false;
  }

  toggleLabelMenu(event: Event): void {
    event.stopPropagation();
    this.showLabelMenu = !this.showLabelMenu;
    this.showColorPicker = false;
  }

  onToggleLabel(label: Label): void {
    this.toggleLabel.emit({ note: this.note, label });
  }

  onRemoveLabel(labelId: number, event: Event): void {
    event.stopPropagation();
    this.removeLabel.emit({ note: this.note, labelId, event });
  }

  onCreateLabel(name: string): void {
    this.createLabel.emit({ note: this.note, name });
  }

  onOpenCollaborator(event: Event): void {
    event.stopPropagation();
    this.openCollaborator.emit({ note: this.note, event });
  }

  onTrash(event: Event): void {
    event.stopPropagation();
    this.trashNote.emit({ note: this.note, event });
  }

  onRestore(event: Event): void {
    event.stopPropagation();
    this.restoreNote.emit({ note: this.note, event });
  }

  onDeleteForever(event: Event): void {
    event.stopPropagation();
    this.deleteForever.emit({ note: this.note, event });
  }

  toggleReminderPicker(event: Event): void {
    event.stopPropagation();
    this.showReminderPicker = !this.showReminderPicker;
    this.showColorPicker = false;
    this.showLabelMenu = false;
  }

  onSetReminder(reminderTime: string): void {
    this.setReminder.emit({ note: this.note, reminderTime });
    this.showReminderPicker = false;
  }

  onRemoveReminder(): void {
    this.removeReminder.emit({ note: this.note });
    this.showReminderPicker = false;
  }

  getInitial(email: string): string {
    return email ? email.charAt(0).toUpperCase() : 'P';
  }
}

