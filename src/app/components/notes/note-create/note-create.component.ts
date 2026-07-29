import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { Label } from '../../dashboard/dashboard.component';
import { ColorOption } from '../../shared/color-picker/color-picker.component';

@Component({
  selector: 'app-note-create',
  templateUrl: './note-create.component.html',
  styleUrls: ['./note-create.component.css']
})
export class NoteCreateComponent implements OnChanges {
  @ViewChild('contentTextarea') contentTextarea?: ElementRef<HTMLTextAreaElement>;

  @Input() activeSection: string = 'notes';
  @Input() selectedLabel: Label | null = null;
  @Input() labels: Label[] = [];
  @Input() colors: ColorOption[] = [];

  @Output() createNote = new EventEmitter<{
    title: string;
    content: string;
    color: string;
    pinned: boolean;
    archived: boolean;
    collaborators: string[];
    labels: Label[];
  }>();
  @Output() trashNewNote = new EventEmitter<{
    title: string;
    content: string;
    color: string;
  }>();
  @Output() openCollaborator = new EventEmitter<void>();

  isInputExpanded = false;
  newNoteTitle = '';
  newNoteContent = '';
  newNoteColor = '#ffffff';
  newNotePinned = false;
  newNoteArchived = false;
  newNoteCollaborators: string[] = [];
  newNoteLabels: Label[] = [];

  showColorPicker = false;
  showLabelMenu = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeSection'] && this.isInputExpanded) {
      this.checkSelectedLabelAutoAdd();
    }
  }

  expandInput(): void {
    this.isInputExpanded = true;
    this.checkSelectedLabelAutoAdd();
    setTimeout(() => this.autoResize(), 0);
  }

  autoResize(event?: Event): void {
    const textarea = event ? (event.target as HTMLTextAreaElement) : this.contentTextarea?.nativeElement;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }

  private checkSelectedLabelAutoAdd(): void {
    if (this.activeSection.startsWith('label_') && this.selectedLabel) {
      if (!this.newNoteLabels.some(l => l.id === this.selectedLabel!.id)) {
        this.newNoteLabels.push(this.selectedLabel);
      }
    }
  }

  closeInput(): void {
    if (this.newNoteTitle.trim() || this.newNoteContent.trim()) {
      this.saveNote();
    } else {
      this.clearNewNote();
    }
    this.isInputExpanded = false;
  }

  saveNote(): void {
    this.createNote.emit({
      title: this.newNoteTitle.trim(),
      content: this.newNoteContent.trim(),
      color: this.newNoteColor,
      pinned: this.newNotePinned,
      archived: this.newNoteArchived,
      collaborators: [...this.newNoteCollaborators],
      labels: [...this.newNoteLabels]
    });
    this.clearNewNote();
  }

  onTrashNewNote(): void {
    if (this.newNoteTitle.trim() || this.newNoteContent.trim()) {
      this.trashNewNote.emit({
        title: this.newNoteTitle.trim(),
        content: this.newNoteContent.trim(),
        color: this.newNoteColor
      });
    }
    this.clearNewNote();
  }

  clearNewNote(): void {
    this.newNoteTitle = '';
    this.newNoteContent = '';
    this.newNoteColor = '#ffffff';
    this.newNotePinned = false;
    this.newNoteArchived = false;
    this.newNoteCollaborators = [];
    this.newNoteLabels = [];
    this.showColorPicker = false;
    this.showLabelMenu = false;
    this.isInputExpanded = false;
  }

  toggleColorPicker(event: Event): void {
    event.stopPropagation();
    this.showColorPicker = !this.showColorPicker;
    this.showLabelMenu = false;
  }

  setNewNoteColor(color: string): void {
    this.newNoteColor = color;
    this.showColorPicker = false;
  }

  toggleLabelMenu(event: Event): void {
    event.stopPropagation();
    this.showLabelMenu = !this.showLabelMenu;
    this.showColorPicker = false;
  }

  toggleLabelForNewNote(label: Label, event?: Event): void {
    if (event) event.stopPropagation();
    const exists = this.newNoteLabels.some(l => l.id === label.id);
    if (exists) {
      this.newNoteLabels = this.newNoteLabels.filter(l => l.id !== label.id);
    } else {
      this.newNoteLabels.push(label);
    }
  }

  onOpenCollaborator(event: Event): void {
    event.stopPropagation();
    this.openCollaborator.emit();
  }

  getInitial(email: string): string {
    return email ? email.charAt(0).toUpperCase() : 'P';
  }
}
