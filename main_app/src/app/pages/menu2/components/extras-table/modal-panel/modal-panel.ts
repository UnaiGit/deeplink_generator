import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type ModalMode = 'add' | 'edit' | 'delete';

export interface Allergen {
  id: string;
  name: string;
  icon: string;
  color: string;
  selected: boolean;
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  uom: string;
}

@Component({
  selector: 'app-extras-modal-panel',
  imports: [CommonModule, FormsModule],
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

  allergens: Allergen[] = [
    { id: 'lupin', name: 'Altramuces (Lupin)', icon: '✓', color: '#3b82f6', selected: false },
    { id: 'gluten', name: 'Contiene Gluten (Gluten)', icon: '🌾', color: '#f97316', selected: false },
    { id: 'fish', name: 'Pescado (Fish)', icon: '🐟', color: '#3b82f6', selected: false },
    { id: 'celery', name: 'Apio (Celery)', icon: '🥬', color: '#22c55e', selected: false },
    { id: 'sesame', name: 'Granos De Sesamo (Sesame Seeds)', icon: '🌰', color: '#a16207', selected: false },
    { id: 'dairy', name: 'Lacteos (Dairy)', icon: '🥛', color: '#a16207', selected: false },
    { id: 'peanuts', name: 'Cacahuetes (Peanuts)', icon: '🥜', color: '#a16207', selected: false },
    { id: 'soy', name: 'Soja (Soy)', icon: '🌱', color: '#22c55e', selected: false },
    { id: 'crustaceans', name: 'Crustaceos (Crustaceans)', icon: '🦀', color: '#3b82f6', selected: false },
    { id: 'molluscs', name: 'Moluscos (Molluscs)', icon: '🐚', color: '#60a5fa', selected: false },
    { id: 'nuts', name: 'Frutos De Cascara (Tree Nuts)', icon: '🌰', color: '#ef4444', selected: false },
    { id: 'mustard', name: 'Mostaza (Mustard)', icon: '🌿', color: '#eab308', selected: false },
    { id: 'eggs', name: 'Huevos (Eggs)', icon: '🥚', color: '#f97316', selected: false },
  ];

  ingredientSearch: string = '';
  ingredientQuantity: string = '';
  ingredientUom: string = 'kg';
  uomOptions: string[] = ['kg', 'g', 'L', 'mL', 'pcs'];

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
  }
}

