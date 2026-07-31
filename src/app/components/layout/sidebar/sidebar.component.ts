import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Label } from '../../dashboard/dashboard.component';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() sidebarExpanded: boolean = true;
  @Input() activeSection: string = 'notes';
  @Input() labels: Label[] = [];
  @Input() isLoading: boolean = false;

  @Output() sectionSelect = new EventEmitter<string>();
  @Output() labelSelect = new EventEmitter<Label>();
  @Output() openEditLabels = new EventEmitter<void>();

  selectSection(section: string): void {
    this.sectionSelect.emit(section);
  }

  selectLabel(label: Label): void {
    this.labelSelect.emit(label);
  }

  onOpenEditLabels(): void {
    this.openEditLabels.emit();
  }
}
