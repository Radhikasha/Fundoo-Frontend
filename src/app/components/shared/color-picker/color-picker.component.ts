import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface ColorOption {
  name: string;
  value: string;
}

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.css']
})
export class ColorPickerComponent {
  @Input() selectedColor: string = '#ffffff';
  @Input() colors: ColorOption[] = [
    { name: 'Default', value: '#ffffff' },
    { name: 'Coral', value: '#f28b82' },
    { name: 'Peach', value: '#fbbc04' },
    { name: 'Sand', value: '#fff475' },
    { name: 'Mint', value: '#ccff90' },
    { name: 'Sage', value: '#a7ffeb' },
    { name: 'Fog', value: '#cbf0f8' },
    { name: 'Storm', value: '#aecbfa' },
    { name: 'Dusk', value: '#d7aefb' },
    { name: 'Blossom', value: '#fdcfe8' },
    { name: 'Clay', value: '#e6c9a8' },
    { name: 'Chalk', value: '#e8eaed' }
  ];
  @Input() directionUp: boolean = false;

  @Output() colorSelect = new EventEmitter<string>();

  selectColor(colorValue: string, event: Event): void {
    event.stopPropagation();
    this.colorSelect.emit(colorValue);
  }
}
