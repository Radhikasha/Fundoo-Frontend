import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
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
  @Output() closePopover = new EventEmitter<void>();

  searchQuery = '';

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.closePopover.emit();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closePopover.emit();
  }

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

