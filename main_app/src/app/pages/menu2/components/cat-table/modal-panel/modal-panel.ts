import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ModalContext, ModalMode } from '@/types/menu2/modes.type';

@Component({
  selector: 'app-modal-panel',
  imports: [CommonModule, FormsModule],
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
    } else {
      this.resetForm();
    }
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
    this.openAdd.emit();
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
