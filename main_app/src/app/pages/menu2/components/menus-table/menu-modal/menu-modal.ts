import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { MenuModalMode } from '@/types/menu2/modes.type';
import { DishItem } from '@/types/interfaces/menu2/modals';
import { BaseModalComponent } from '../../../../../shared/components/modal/base-modal';
import { ModalConfig } from '../../../../../shared/components/modal/modal-config.type';

@Component({
  selector: 'app-menu-modal',
  imports: [CommonModule, FormsModule, TranslateModule, BaseModalComponent],
  templateUrl: './menu-modal.html',
  styleUrl: './menu-modal.scss',
  standalone: true,
})
export class MenuModal implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() mode: MenuModalMode = 'add';
  @Input() data: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  // Time picker state
  showTimePicker: boolean = false;
  selectedHour: number = 21;
  timePickerMode: 'from' | 'until' | null = null;

  formData: any = {
    category: 'Atlantic',
    price: 8,
    availability: {
      days: ['Mon'],
      from: '09:30',
      until: '21:00'
    },
    dishes: [
      { dish: 'Prawns', extraCost: '0..20' }
    ]
  };

  categories: string[] = [
    'Atlantic',
    'Stations',
    'Flavors of Asia',
    'Mediterranean',
    'Continental'
  ];

  days: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  hours: number[] = Array.from({ length: 24 }, (_, i) => i);

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(): void {
    if (this.isOpen && this.data) {
      this.loadData();
    }
  }

  getModalConfig(): ModalConfig {
    if (this.isDeleteMode()) {
      return {
        position: 'center',
        width: '90%',
        maxWidth: '420px',
        animation: 'scale',
        borderRadius: '16px',
        closeOnOverlayClick: false
      };
    }
    return {
      position: 'right',
      width: '100%',
      maxWidth: '500px',
      height: '100%',
      animation: 'slide'
    };
  }

  initializeForm(): void {
    // Initialize with default values
  }

  loadData(): void {
    if (this.data) {
      this.formData = { ...this.formData, ...this.data };
    }
  }

  isDaySelected(day: string): boolean {
    return this.formData.availability.days.includes(day);
  }

  toggleDay(day: string): void {
    const days = this.formData.availability.days;
    const index = days.indexOf(day);
    
    if (index > -1) {
      days.splice(index, 1);
    } else {
      days.push(day);
    }
  }

  openTimePicker(mode: 'from' | 'until'): void {
    this.timePickerMode = mode;
    this.showTimePicker = true;
    
    // Set the selected hour based on the current time in the field
    const time = mode === 'from' ? this.formData.availability.from : this.formData.availability.until;
    const [hours] = time.split(':').map((v: string) => parseInt(v));
    this.selectedHour = hours;
  }

  closeTimePicker(): void {
    this.showTimePicker = false;
    this.timePickerMode = null;
  }

  getHourPosition(hour: number): { x: number; y: number } {
    // Position hours around a circle
    // 0 is at top, going clockwise
    const angle = (hour * 15 - 90) * (Math.PI / 180); // 15 degrees per hour, -90 to start at top
    const radius = 110; // Distance from center
    return {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle)
    };
  }

  selectHour(hour: number): void {
    this.selectedHour = hour;
    
    // Update the time in the form data
    const timeString = `${hour.toString().padStart(2, '0')}:00`;
    
    if (this.timePickerMode === 'from') {
      this.formData.availability.from = timeString;
    } else if (this.timePickerMode === 'until') {
      this.formData.availability.until = timeString;
    }
    
    // Close the time picker after selection
    setTimeout(() => {
      this.closeTimePicker();
    }, 300);
  }

  getHandRotation(): number {
    return this.selectedHour * 15; // 15 degrees per hour
  }

  getHandEndPosition(): { x: number; y: number } {
    const angle = (this.selectedHour * 15 - 90) * (Math.PI / 180);
    const radius = 90; // Slightly shorter than hour positions
    return {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle)
    };
  }

  addDish(): void {
    this.formData.dishes.push({
      dish: '',
      extraCost: ''
    });
  }

  removeDish(index: number): void {
    this.formData.dishes.splice(index, 1);
  }

  onClose(): void {
    this.close.emit();
  }

  onSave(): void {
    this.save.emit(this.formData);
  }

  onDelete(): void {
    this.delete.emit(this.data);
  }

  isDeleteMode(): boolean {
    return this.mode === 'delete';
  }

  getTitle(): string {
    if (this.mode === 'add') return 'Create Menu';
    if (this.mode === 'edit') return 'Edit Menu';
    return 'Delete Menu';
  }

  getButtonText(): string {
    if (this.mode === 'add') return 'Update plate';
    if (this.mode === 'edit') return 'Update Menu';
    return 'Delete';
  }

  getTranslatedTitle(): string {
    return this.getTitle();
  }

  getTranslatedButtonText(): string {
    return this.getButtonText();
  }
}

