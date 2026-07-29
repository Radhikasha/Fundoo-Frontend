import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Note } from '../../dashboard/dashboard.component';

@Component({
  selector: 'app-collaborator-modal',
  templateUrl: './collaborator-modal.component.html',
  styleUrls: ['./collaborator-modal.component.css']
})
export class CollaboratorModalComponent implements OnChanges {
  @Input() note: Note | null = null;
  @Input() userEmail: string = '';
  @Input() isAdding: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() addCollaborator = new EventEmitter<string>();
  @Output() removeCollaborator = new EventEmitter<string>();

  collaboratorEmail = '';
  collaboratorError = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isAdding'] && !changes['isAdding'].currentValue && changes['isAdding'].previousValue) {
      if (!this.collaboratorError) {
        this.collaboratorEmail = '';
      }
    }
  }

  get ownerEmail(): string {
    return this.note?.ownerEmail || this.userEmail;
  }

  get collaboratorsList(): string[] {
    return this.note?.collaborators || [];
  }

  onAdd(): void {
    if (this.isAdding) return;

    const email = this.collaboratorEmail.trim();
    if (!email) return;

    if (!email.includes('@')) {
      this.collaboratorError = 'Please enter a valid email address';
      return;
    }

    if (email === this.ownerEmail) {
      this.collaboratorError = 'Owner is already a collaborator';
      return;
    }

    if (this.collaboratorsList.includes(email)) {
      this.collaboratorError = 'This person is already a collaborator';
      return;
    }

    this.collaboratorError = '';
    this.addCollaborator.emit(email);
  }

  onRemove(email: string): void {
    this.removeCollaborator.emit(email);
  }

  onClose(): void {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('collab-modal-overlay')) {
      this.onClose();
    }
  }
}
