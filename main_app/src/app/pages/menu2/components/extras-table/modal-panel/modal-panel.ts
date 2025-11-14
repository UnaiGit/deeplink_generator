import { Component, Input, Output, EventEmitter, OnInit, OnChanges, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ModalMode } from '@/types/menu2/modes.type';

import { Allergen, Ingredient } from '@/types/interfaces/menu2/modals';
import { BaseModalComponent } from '@/app/shared/components/modal/base-modal';
import { ModalConfig } from '@/app/shared/components/modal/modal-config.type';

@Component({
  selector: 'app-extras-modal-panel',
  imports: [CommonModule, FormsModule, BaseModalComponent],
  templateUrl: './modal-panel.html',
  styleUrl: './modal-panel.scss',
})
export class ExtrasModalPanel implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() mode: ModalMode = 'add';
  @Input() data: any = null;
  @Input() availableExtras: string[] = [];
  @Input() selectedExtras: string[] = [];
  @Input() showExtrasList: boolean = false;
  @Input() showSubcategoryModal: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() openAdd = new EventEmitter<void>();
  @Output() editExtra = new EventEmitter<any>();
  @Output() deleteExtra = new EventEmitter<any>();
  @Output() updateExtras = new EventEmitter<void>();
  @Output() toggleExtra = new EventEmitter<string>();
  @Output() saveSubcategory = new EventEmitter<any>();

  formData: any = {
    name: '',
    price: 0,
    allergens: [],
    ingredients: [],
    inventoryRule: 'deducts',
    format: 'Multiselector',
    min: '',
    max: '',
    category: '',
    mandatory: false,
  };

  subcategoryData: any = {
    name: '',
    format: 'Multiselector',
    min: '',
    max: '',
    category: '',
    mandatory: false,
  };

  formatOptions: string[] = ['Multiselector', 'Single Selector', 'Text Input', 'Number Input'];
  categoryOptions: string[] = ['Meals', 'Drinks', 'Desserts', 'Sauces', 'Sides'];

  get allergens(): Allergen[] {
    return [
      { id: 'lupin', name: 'Altramuces (Lupin)', icon: '✓', color: this.getCssVariable('--icon-blue'), selected: false },
      { id: 'gluten', name: 'Contiene Gluten (Gluten)', icon: '🌾', color: this.getCssVariable('--orange'), selected: false },
      { id: 'fish', name: 'Pescado (Fish)', icon: '🐟', color: this.getCssVariable('--icon-blue'), selected: false },
      { id: 'celery', name: 'Apio (Celery)', icon: '🥬', color: this.getCssVariable('--icon-green'), selected: false },
      { id: 'sesame', name: 'Granos De Sesamo (Sesame Seeds)', icon: '🌰', color: this.getCssVariable('--dark-yellow'), selected: false },
      { id: 'dairy', name: 'Lacteos (Dairy)', icon: '🥛', color: this.getCssVariable('--dark-yellow'), selected: false },
      { id: 'peanuts', name: 'Cacahuetes (Peanuts)', icon: '🥜', color: this.getCssVariable('--dark-yellow'), selected: false },
      { id: 'soy', name: 'Soja (Soy)', icon: '🌱', color: this.getCssVariable('--icon-green'), selected: false },
      { id: 'crustaceans', name: 'Crustaceos (Crustaceans)', icon: '🦀', color: this.getCssVariable('--icon-blue'), selected: false },
      { id: 'molluscs', name: 'Moluscos (Molluscs)', icon: '🐚', color: this.getCssVariable('--primary-blue-light'), selected: false },
      { id: 'nuts', name: 'Frutos De Cascara (Tree Nuts)', icon: '🌰', color: this.getCssVariable('--danger-color'), selected: false },
      { id: 'mustard', name: 'Mostaza (Mustard)', icon: '🌿', color: this.getCssVariable('--icon-orange'), selected: false },
      { id: 'eggs', name: 'Huevos (Eggs)', icon: '🥚', color: this.getCssVariable('--orange'), selected: false },
    ];
  }

  ingredientSearch: string = '';
  ingredientQuantity: string = '';
  ingredientUom: string = 'kg';
  uomOptions: string[] = ['kg', 'g', 'L', 'mL', 'pcs'];
  showFormatDropdown: boolean = false;

  constructor(private el: ElementRef) {}

  private getCssVariable(variable: string, fallback: string = ''): string {
    if (typeof document === 'undefined') return fallback;
    const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    return value || fallback;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.showFormatDropdown) {
      const formatGroup = this.el.nativeElement.querySelector('.format-group');
      if (formatGroup && !formatGroup.contains(event.target as Node)) {
        this.showFormatDropdown = false;
      }
    }
  }

  ngOnInit(): void {
    if (this.mode === 'edit' && this.data) {
      this.formData = {
        name: this.data.name || '',
        price: this.data.price || 0,
        allergens: this.data.allergens || [],
        ingredients: this.data.ingredients || [],
        inventoryRule: this.data.inventoryRule || 'deducts',
        format: this.data.format || 'Multiselector',
        min: this.data.min || '',
        max: this.data.max || '',
        category: this.data.category || '',
        mandatory: this.data.mandatory || false,
      };
      // Restore allergen selections
      if (this.data.allergens) {
        this.allergens.forEach((allergen) => {
          allergen.selected = this.data.allergens.includes(allergen.id);
        });
      }
    } else {
      this.resetForm();
    }
  }

  ngOnChanges(): void {
    if (this.mode === 'edit' && this.data) {
      this.formData = {
        name: this.data.name || '',
        price: this.data.price || 0,
        allergens: this.data.allergens || [],
        ingredients: this.data.ingredients || [],
        inventoryRule: this.data.inventoryRule || 'deducts',
        format: this.data.format || 'Multiselector',
        min: this.data.min || '',
        max: this.data.max || '',
        category: this.data.category || '',
        mandatory: this.data.mandatory || false,
      };
      // Restore allergen selections
      if (this.data.allergens) {
        this.allergens.forEach((allergen) => {
          allergen.selected = this.data.allergens.includes(allergen.id);
        });
      }
    } else {
      this.resetForm();
    }
    
    // Initialize selected extras for add mode if not already set
    if (this.mode === 'add' && this.isOpen && (!this.selectedExtras || this.selectedExtras.length === 0)) {
      // Use availableExtras as default selected items
      if (this.availableExtras && this.availableExtras.length > 0) {
        // This will be handled by parent component, but ensure we have data
      }
    }
  }

  getModalConfig(): ModalConfig {
    if (this.isDeleteMode() && !this.showSubcategoryModal) {
      return {
        position: 'center',
        width: '90%',
        maxWidth: '480px',
        animation: 'scale',
        borderRadius: '16px',
        closeOnOverlayClick: false,
      };
    }
    if (this.mode === 'add' && !this.showExtrasList) {
      // Dual panel (extra group + extra)
      return {
        position: 'right',
        width: '100%',
        maxWidth: '960px',
        height: '100%',
        animation: 'slide',
        backgroundColor: 'transparent',
      };
    }
    // Side panel defaults
    return {
      position: 'right',
      width: '100%',
      maxWidth: '480px',
      height: '100%',
      animation: 'slide',
    };
  }

  resetForm(): void {
    this.formData = {
      name: '',
      price: 0,
      allergens: [],
      ingredients: [],
      inventoryRule: 'deducts',
      format: 'Multiselector',
      min: '',
      max: '',
      category: '',
      mandatory: false,
    };
    this.allergens.forEach((allergen) => (allergen.selected = false));
    this.ingredientSearch = '';
    this.ingredientQuantity = '';
    this.ingredientUom = 'kg';
  }

  getTitle(): string {
    if (this.mode === 'delete') {
      return 'Do you want to delete this extra?';
    }
    if (this.showExtrasList) {
      return 'Extras';
    }
    if (this.showSubcategoryModal) {
      return 'Name';
    }
    return `${this.mode === 'add' ? 'Create' : 'Edit'} Extra`;
  }

  getDeleteMessage(): string {
    return 'Deleting this extra will remove it permanently';
  }

  isDeleteMode(): boolean {
    return this.mode === 'delete';
  }

  getButtonText(): string {
    if (this.mode === 'edit') {
      return 'Update extras';
    }
    return 'Create extra';
  }

  onClose(): void {
    this.isOpen = false;
    this.showFormatDropdown = false;
    this.close.emit();
  }

  onSave(): void {
    // Collect selected allergens
    this.formData.allergens = this.allergens
      .filter((a) => a.selected)
      .map((a) => a.id);
    this.save.emit(this.formData);
    this.onClose();
  }

  onDelete(): void {
    this.delete.emit(this.data);
    this.onClose();
  }

  toggleAllergen(allergen: Allergen): void {
    allergen.selected = !allergen.selected;
  }

  addIngredient(): void {
    if (this.ingredientSearch && this.ingredientQuantity) {
      const ingredient: Ingredient = {
        id: Date.now().toString(),
        name: this.ingredientSearch,
        quantity: parseFloat(this.ingredientQuantity),
        uom: this.ingredientUom,
      };
      this.formData.ingredients.push(ingredient);
      this.ingredientSearch = '';
      this.ingredientQuantity = '';
      this.ingredientUom = 'kg';
    }
  }

  removeIngredient(ingredientId: string): void {
    this.formData.ingredients = this.formData.ingredients.filter(
      (ing: Ingredient) => ing.id !== ingredientId
    );
  }

  onOpenAdd(): void {
    this.openAdd.emit();
  }

  onEditExtra(extra: any): void {
    this.editExtra.emit(extra);
  }

  onDeleteExtra(extra: any): void {
    this.deleteExtra.emit(extra);
  }

  onUpdateExtras(): void {
    this.updateExtras.emit();
  }

  removeExtraFromList(extra: string): void {
    // Toggle extra selection
    this.toggleExtra.emit(extra);
  }

  isExtraSelected(extra: string): boolean {
    return this.selectedExtras?.includes(extra) || false;
  }

  onAddSubcategory(): void {
    // Reset subcategory form
    this.subcategoryData = {
      name: '',
      format: 'Multiselector',
      min: '',
      max: '',
      category: '',
      mandatory: false,
    };
    // Emit event to parent to show subcategory modal
    this.openAdd.emit();
  }

  onSaveSubcategory(): void {
    this.saveSubcategory.emit(this.subcategoryData);
    this.subcategoryData = {
      name: '',
      format: 'Multiselector',
      min: '',
      max: '',
      category: '',
      mandatory: false,
    };
  }

  onCloseSubcategory(): void {
    this.subcategoryData = {
      name: '',
      format: 'Multiselector',
      min: '',
      max: '',
      category: '',
      mandatory: false,
    };
    this.showFormatDropdown = false;
  }

  toggleFormatDropdown(): void {
    this.showFormatDropdown = !this.showFormatDropdown;
  }

  selectFormat(format: string): void {
    this.subcategoryData.format = format;
    this.showFormatDropdown = false;
  }

  getFormatDisplayName(): string {
    if (this.subcategoryData.format === 'Multiselector') {
      return 'Multiselector';
    }
    if (this.subcategoryData.format === 'Single Selector') {
      return 'Single Selector';
    }
    return this.subcategoryData.format;
  }
}

