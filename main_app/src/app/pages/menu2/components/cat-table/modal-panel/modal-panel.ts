import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ModalContext, ModalMode } from '@/types/menu2/modes.type';
import { BaseModalComponent } from '../../../../../shared/components/modal/base-modal';
import { ModalConfig } from '../../../../../shared/components/modal/modal-config.type';

@Component({
  selector: 'app-modal-panel',
  imports: [CommonModule, FormsModule, BaseModalComponent],
  templateUrl: './modal-panel.html',
  styleUrl: './modal-panel.scss',
})
export class ModalPanel implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() context: ModalContext = 'category';
  @Input() mode: ModalMode = 'add';
  @Input() data: any = null;
  @Input() categories: any[] = [];
  @Input() showCategoriesList: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() openAdd = new EventEmitter<void>();
  @Output() editCategory = new EventEmitter<any>();
  @Output() deleteCategory = new EventEmitter<any>();
  @Output() updateCategories = new EventEmitter<void>();

  showAddFormInList: boolean = false;

  formData: any = {
    name: '',
    type: 'Menu',
    icon: '',
    price: 0,
    itemsNumber: 0,
    available: true,
    visibility: true,
    defaultExtras: [],
    order: '',
  };

  iconOptions = [
    { value: 'dish', icon: '🍽️' },
    { value: 'category', icon: '📁' },
    { value: 'extra', icon: '➕' },
    { value: 'departure', icon: '📋' },
    { value: 'menu', icon: '📖' },
  ];

  typeOptions = ['Dishes', 'Extras', 'Categories', 'Order of departure', 'Menus'];

  ngOnInit(): void {
    if (this.mode === 'edit' && this.data) {
      this.formData = { ...this.data };
    } else {
      this.resetForm();
    }
  }

  ngOnChanges(): void {
    if (this.mode === 'edit' && this.data) {
      this.formData = { ...this.data };
    } else if (!this.showAddFormInList) {
      this.resetForm();
    }
  }

  getModalConfig(): ModalConfig {
    if (this.mode === 'delete') {
      return {
        position: 'center',
        width: '90%',
        maxWidth: '480px',
        animation: 'scale',
        borderRadius: '16px',
        closeOnOverlayClick: false
      };
    }
    return {
      position: 'right',
      width: '100%',
      maxWidth: '480px',
      height: '100%',
      animation: 'slide'
    };
  }

  resetForm(): void {
    this.formData = {
      name: '',
      type: 'Dishes',
      icon: '',
      price: 0,
      itemsNumber: 0,
      available: true,
      visibility: true,
      defaultExtras: [],
      order: '',
    };
  }

  getTitle(): string {
    if (this.mode === 'delete') {
      const contextNames: { [key: string]: string } = {
        dish: 'dish',
        category: 'category',
        extra: 'extra',
        departure: 'order of departure',
        menu: 'menu',
      };
      return `Do you want to delete this ${contextNames[this.context]}?`;
    }
    const contextNames: { [key: string]: string } = {
      dish: 'Dish',
      category: 'Category',
      extra: 'Extra',
      departure: 'Order of departure',
      menu: 'Menu',
    };
    return `${this.mode === 'add' ? 'Add' : 'Edit'} ${contextNames[this.context]}`;
  }

  getDeleteMessage(): string {
    const contextNames: { [key: string]: string } = {
      dish: 'dish',
      category: 'category',
      extra: 'extra',
      departure: 'order of departure',
      menu: 'menu',
    };
    return `Deleting this ${contextNames[this.context]} will remove it permanently`;
  }

  isDeleteMode(): boolean {
    return this.mode === 'delete';
  }

  getButtonText(): string {
    if (this.mode === 'edit') {
      if (this.context === 'category') {
        return 'Update category';
      }
      return `Update ${this.context}`;
    }
    return 'Save';
  }

  onClose(): void {
    this.isOpen = false;
    this.showAddFormInList = false;
    this.resetForm();
    this.close.emit();
  }

  onSave(): void {
    this.save.emit(this.formData);
    this.onClose();
  }

  onDelete(): void {
    this.delete.emit(this.data);
    this.onClose();
  }

  selectIcon(icon: string): void {
    this.formData.icon = icon;
  }

  onOpenAdd(): void {
    this.showAddFormInList = true;
    this.resetForm();
    this.openAdd.emit();
  }

  onCancelAddForm(): void {
    this.showAddFormInList = false;
    this.resetForm();
  }

  onSaveAddForm(): void {
    this.save.emit(this.formData);
    this.showAddFormInList = false;
    this.resetForm();
  }

  onEditCategory(category: any): void {
    this.editCategory.emit(category);
  }

  onDeleteCategory(category: any): void {
    this.deleteCategory.emit(category);
  }

  onUpdateCategories(): void {
    this.updateCategories.emit();
  }
}
