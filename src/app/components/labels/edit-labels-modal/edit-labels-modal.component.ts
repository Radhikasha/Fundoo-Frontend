import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Label } from '../../dashboard/dashboard.component';

@Component({
  selector: 'app-edit-labels-modal',
  templateUrl: './edit-labels-modal.component.html',
  styleUrls: ['./edit-labels-modal.component.css']
})
export class EditLabelsModalComponent {
  @Input() labels: Label[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() createLabel = new EventEmitter<string>();
  @Output() updateLabel = new EventEmitter<{ label: Label; name: string }>();
  @Output() deleteLabel = new EventEmitter<Label>();

  newLabelName = '';
  editingLabelId: number | null = null;
  editingLabelName = '';

  onCreate(): void {
    const name = this.newLabelName.trim();
    if (name) {
      this.createLabel.emit(name);
      this.newLabelName = '';
    }
  }

  startEditing(label: Label): void {
    this.editingLabelId = label.id;
    this.editingLabelName = label.name;
  }

  saveEdit(label: Label): void {
    const name = this.editingLabelName.trim();
    if (name && name !== label.name) {
      this.updateLabel.emit({ label, name });
    }
    this.editingLabelId = null;
    this.editingLabelName = '';
  }

  onDelete(label: Label, event: Event): void {
    event.stopPropagation();
    this.deleteLabel.emit(label);
  }

  onClose(): void {
    if (this.newLabelName.trim()) {
      this.onCreate();
    }
    if (this.editingLabelId && this.editingLabelName.trim()) {
      const labelToSave = this.labels.find(l => l.id === this.editingLabelId);
      if (labelToSave) {
        this.saveEdit(labelToSave);
      }
    }
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('collab-modal-overlay')) {
      this.onClose();
    }
  }
}
