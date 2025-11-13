import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StaffMember } from '@/types/interfaces/employees/staff-member.interface';
import { BaseModalComponent } from '../../../../../shared/components/modal/base-modal';
import { ModalConfig } from '../../../../../shared/components/modal/modal-config.type';

@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseModalComponent],
  templateUrl: './add-employee.html',
  styleUrl: './add-employee.scss',
})
export class AddEmployee implements OnChanges {
  @Input() isOpen: boolean = false;
  @Input() employee: StaffMember | null = null;
  @Input() isEditMode: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  formData = {
    name: '',
    phone: '',
    email: '',
    hoursPerDay: '',
    currency: 'USD',
    salaryPerHour: '',
    tags: [] as string[],
  };

  currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
  availableTags = ['Waiter', 'Delivery', 'Cooking', 'Cashier', 'Manager'];

  ngOnChanges(changes: SimpleChanges): void {
    // Check if modal is opening
    if (changes['isOpen'] && this.isOpen) {
      // When modal opens, load employee data if in edit mode
      if (this.isEditMode && this.employee) {
        this.loadEmployeeData();
      } else if (!this.isEditMode) {
        // Reset form when opening in add mode
        this.resetForm();
      }
    }
    
    // Check if modal is closing
    if (changes['isOpen'] && !this.isOpen) {
      // Reset form when closing
      this.resetForm();
    }
    
    // Check if employee data changed (important for edit mode)
    if (changes['employee'] && this.employee && this.isEditMode) {
      this.loadEmployeeData();
    }
    
    // Check if edit mode changed
    if (changes['isEditMode'] && this.isEditMode && this.employee && this.isOpen) {
      this.loadEmployeeData();
    }
  }

  getModalConfig(): ModalConfig {
    return {
      position: 'right',
      width: '100%',
      maxWidth: '500px',
      height: '100%',
      animation: 'slide'
    };
  }

  loadEmployeeData(): void {
    if (this.employee) {
      console.log('Loading employee data:', JSON.parse(JSON.stringify(this.employee)));
      // Create a deep copy to ensure we have all fields
      const emp = { ...this.employee };
      this.formData = {
        name: emp.name || '',
        phone: emp.phone || '',
        email: emp.email || '',
        hoursPerDay: emp.hoursPerDay || '',
        currency: emp.currency || 'USD',
        salaryPerHour: emp.salaryPerHour || '',
        tags: [...(emp.tags || [])],
      };
      console.log('Form data loaded:', this.formData);
    } else {
      console.warn('No employee data provided for editing');
    }
  }

  onClose(): void {
    this.close.emit();
    this.resetForm();
  }

  onSave(): void {
    if (this.isFormValid()) {
      this.save.emit({ ...this.formData });
      this.resetForm();
      this.onClose();
    }
  }

  isFormValid(): boolean {
    if (this.isEditMode) {
      // In edit mode, only name is required
      return !!this.formData.name;
    }
    // In add mode, all fields are required
    return !!(
      this.formData.name &&
      this.formData.phone &&
      this.formData.email &&
      this.formData.hoursPerDay &&
      this.formData.salaryPerHour
    );
  }

  toggleTag(tag: string): void {
    const index = this.formData.tags.indexOf(tag);
    if (index > -1) {
      this.formData.tags.splice(index, 1);
    } else {
      this.formData.tags.push(tag);
    }
  }

  isTagSelected(tag: string): boolean {
    return this.formData.tags.includes(tag);
  }

  resetForm(): void {
    this.formData = {
      name: '',
      phone: '',
      email: '',
      hoursPerDay: '',
      currency: 'USD',
      salaryPerHour: '',
      tags: [],
    };
  }
}

