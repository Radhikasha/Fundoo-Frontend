import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Label } from '../../dashboard/dashboard.component';

@Component({
  selector: 'app-label-popover',
  templateUrl: './label-popover.component.html',
  styleUrls: ['./label-popover.component.css']
})
export class LabelPopoverComponent {
  @Input() labels: Label[] = [];
  @Input() noteLabels: Label[] = [];
  @Input() directionUp: boolean = false;

  @Output() toggleLabel = new EventEmitter<Label>();
  @Output() createLabel = new EventEmitter<string>();

  searchQuery = '';

  get filteredLabels(): Label[] {
    if (!this.searchQuery.trim()) return this.labels;
    const q = this.searchQuery.toLowerCase();
    return this.labels.filter(l => l.name.toLowerCase().includes(q));
  }

  isLabelChecked(labelId: number): boolean {
    return this.noteLabels.some(l => l.id === labelId);
  }

  onToggleLabel(label: Label, event: Event): void {
    event.stopPropagation();
    this.toggleLabel.emit(label);
  }

  onCreateLabel(event: Event): void {
    event.stopPropagation();
    const query = this.searchQuery.trim();
    if (query) {
      this.createLabel.emit(query);
      this.searchQuery = '';
    }
  }
}
