import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DishModalMode } from '@/types/menu2/modes.type';

import { Allergen, ExtraToggle as Extra, ExtraGroup, Subcategory, SubcategoryItem } from '@/types/interfaces/menu2/modals';

@Component({
  selector: 'app-dish-modal-panel',
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-panel.html',
  styleUrl: './modal-panel.scss',
  standalone: true,
})
export class DishModalPanel implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() mode: DishModalMode = 'add';
  @Input() data: any = null;
  @Input() showExtraModal: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() createExtra = new EventEmitter<void>();

  // Additional modal states
  showSubcategoryModal: boolean = false;
  showFilters: boolean = false;
  showSubcategoryDropdown: boolean = false;
  showIngredientDropdown: boolean = false;
  showSuccessMessage: boolean = false;
  selectionMode: 'Multi' | 'Min1' | 'Max3' = 'Multi';

  formData: any = {
    name: '',
    kitchenDepartment: 'American Cuisine',
    allergens: [],
    price: 0,
    category: '',
    image: null,
    imagePreview: '',
    description: '',
    extras: [],
    ingredients: [],
  };

  extraFormData: any = {
    name: '',
    price: 0,
    subcategory: '',
    allergens: [],
    inventoryRule: 'deducts',
    ingredients: [
      { name: 'Smoked Mayonnaise', quantity: '0.2', uom: 'kg' },
      { name: 'Cras just hate', quantity: '0.2', uom: 'kg', isNew: true },
    ],
  };

  kitchenDepartments: string[] = [
    'American Cuisine',
    'Italian Cuisine',
    'Mexican Cuisine',
    'Asian Cuisine',
    'French Cuisine',
    'Mediterranean Cuisine',
  ];

  categoryOptions: string[] = ['Meats', 'Seafood', 'Vegetarian', 'Pasta', 'Salads', 'Desserts', 'Beverages'];

  allergens: Allergen[] = [
    { id: 'lupin', name: 'Altramuces', icon: '🌱', color: '#10b981', selected: false },
    { id: 'gluten', name: 'Contain Gluten', icon: '🌾', color: '#f59e0b', selected: false },
    { id: 'pescado', name: 'Pescado', icon: '🐟', color: '#3b82f6', selected: false },
    { id: 'apio', name: 'Apio', icon: '🥬', color: '#10b981', selected: false },
    { id: 'grains', name: 'Grains De Sesamo', icon: '🌰', color: '#d97706', selected: false },
    { id: 'lacteos', name: 'Lácteos', icon: '🥛', color: '#8b5cf6', selected: false },
    { id: 'crustaceos', name: 'Crustáceos', icon: '🦐', color: '#06b6d4', selected: false },
    { id: 'molluscs', name: 'Molluscs', icon: '🐚', color: '#f59e0b', selected: false },
    { id: 'huevos', name: 'Huevos', icon: '🥚', color: '#fbbf24', selected: false },
    { id: 'soja', name: 'Soja', icon: '🫘', color: '#22c55e', selected: false },
  ];

  extraGroups: ExtraGroup[] = [
    {
      name: 'Topping Pizza',
      extras: [
        { name: 'Brave Seouce', selected: true },
        { name: 'Rum Sauce', selected: true },
        { name: 'Mustard', selected: true },
        { name: 'Chili', selected: true },
        { name: 'Ketchup', selected: true },
      ],
    },
    {
      name: 'Topping Burger',
      extras: [
        { name: 'Aioli', selected: true },
        { name: 'Cheese', selected: true },
        { name: 'Smoked Mayonnaise', selected: true },
      ],
    },
  ];

  ingredientSearch: string = '';
  ingredientQuantity: string = '';
  ingredientUom: string = 'kg';

  // Subcategory data
  subcategoryFormData: any = {
    name: '',
    format: 'Multiselector',
    min: 1,
    max: 10,
    category: '',
    mandatory: true,
  };

  subcategories: Subcategory[] = [
    {
      id: '1',
      name: 'Topping Pizza',
      format: 'Multi',
      min: 1,
      max: 3,
      position: 'Before Starter',
      expanded: true,
      items: [
        { name: 'Hamburger Sauces', checked: true },
        { name: 'Proteins', checked: false },
        { name: 'Cooking', checked: false },
        { name: 'Carbohydrates', checked: false },
      ],
    },
  ];

  // Ingredient suggestions
  ingredientSuggestions: string[] = [
    'Cras just hate',
    'Dapibus ac facilisis in',
    'Porta ac consectetur ac',
    'Vestibulum at eros',
  ];

  filteredIngredients: string[] = [];

  // Filter data
  filterData = {
    subcategory: 'Topping Pizza',
    allergen: 'Apio',
    allergenAvailable: true,
  };

  ngOnInit(): void {
    if (this.mode === 'edit' && this.data) {
      this.formData = { ...this.data };
      this.syncAllergens();
    } else {
      this.resetForm();
    }
  }

  ngOnChanges(): void {
    if (this.mode === 'edit' && this.data) {
      this.formData = { ...this.data };
      this.syncAllergens();
    } else if (this.mode === 'add') {
      this.resetForm();
    }
  }

  syncAllergens(): void {
    if (this.formData.allergens) {
      this.allergens.forEach((allergen) => {
        allergen.selected = this.formData.allergens.includes(allergen.id);
      });
    }
  }

  resetForm(): void {
    this.formData = {
      name: '',
      kitchenDepartment: 'American Cuisine',
      allergens: [],
      price: 0,
      category: '',
      image: null,
      imagePreview: '',
      description: '',
      extras: [],
      ingredients: [],
    };
    this.allergens.forEach((allergen) => (allergen.selected = false));
    this.extraGroups.forEach((group) => {
      group.extras.forEach((extra) => (extra.selected = false));
    });
  }

  toggleAllergen(allergen: Allergen): void {
    allergen.selected = !allergen.selected;
    this.updateFormAllergens();
  }

  updateFormAllergens(): void {
    this.formData.allergens = this.allergens
      .filter((allergen) => allergen.selected)
      .map((allergen) => allergen.id);
  }

  toggleExtra(extra: Extra): void {
    extra.selected = !extra.selected;
  }

  removeExtra(groupName: string, extraName: string): void {
    const group = this.extraGroups.find((g) => g.name === groupName);
    if (group) {
      const extra = group.extras.find((e) => e.name === extraName);
      if (extra) {
        extra.selected = false;
      }
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.formData.image = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.formData.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  triggerFileInput(): void {
    document.getElementById('fileInput')?.click();
  }

  onSave(): void {
    const selectedExtras: string[] = [];
    this.extraGroups.forEach((group) => {
      group.extras.forEach((extra) => {
        if (extra.selected) {
          selectedExtras.push(extra.name);
        }
      });
    });
    this.formData.extras = selectedExtras;

    this.save.emit(this.formData);
    this.close.emit();
  }

  onDelete(): void {
    this.delete.emit(this.formData);
    this.close.emit();
  }

  onClose(): void {
    this.close.emit();
  }

  onCreateExtra(): void {
    this.createExtra.emit();
  }

  isDeleteMode(): boolean {
    return this.mode === 'delete';
  }

  getTitle(): string {
    if (this.isDeleteMode()) {
      return 'Delete Dish';
    }
    if (this.showExtraModal) {
      return 'Create/Edit Extra';
    }
    return this.mode === 'edit' ? 'Dish' : 'Dish';
  }

  getButtonText(): string {
    return this.mode === 'edit' ? 'Update plate' : 'Create Dish';
  }

  getDeleteMessage(): string {
    return `Are you sure you want to delete "${this.formData.name || 'this dish'}"? This action cannot be undone.`;
  }

  getSelectedExtrasCount(group: ExtraGroup): number {
    return group.extras.filter((e) => e.selected).length;
  }

  onCloseExtraModal(): void {
    this.showExtraModal = false;
    this.showSubcategoryDropdown = false;
    this.showIngredientDropdown = false;
    this.resetExtraForm();
  }

  resetExtraForm(): void {
    this.extraFormData = {
      name: '',
      price: 0,
      subcategory: '',
      allergens: [],
      inventoryRule: 'deducts',
      ingredients: [
        { name: 'Smoked Mayonnaise', quantity: '0.2', uom: 'kg' },
        { name: 'Cras just hate', quantity: '0.2', uom: 'kg', isNew: true },
      ],
    };
    this.ingredientSearch = '';
    this.ingredientQuantity = '';
    this.ingredientUom = 'kg';
  }

  addIngredient(): void {
    if (this.ingredientSearch && this.ingredientQuantity && this.ingredientUom) {
      const ingredient = {
        name: this.ingredientSearch,
        quantity: this.ingredientQuantity,
        uom: this.ingredientUom,
      };
      
      if (this.showExtraModal) {
        this.extraFormData.ingredients.push(ingredient);
      } else {
        this.formData.ingredients.push(ingredient);
      }
      
      // Reset ingredient fields
      this.ingredientSearch = '';
      this.ingredientQuantity = '';
      this.ingredientUom = 'kg';
    }
  }

  removeIngredient(ingredientName: string): void {
    if (this.showExtraModal) {
      this.extraFormData.ingredients = this.extraFormData.ingredients.filter(
        (i: any) => i.name !== ingredientName
      );
    } else {
      this.formData.ingredients = this.formData.ingredients.filter(
        (i: any) => i.name !== ingredientName
      );
    }
  }

  onSaveExtra(): void {
    console.log('Saving extra:', this.extraFormData);
    // Here you would save the extra and attach it to the dish
    this.showSuccessMessage = true;
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 3000);
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  toggleSubcategoryDropdown(): void {
    this.showSubcategoryDropdown = !this.showSubcategoryDropdown;
  }

  openSubcategoryModal(): void {
    this.showSubcategoryModal = true;
    this.showSubcategoryDropdown = false;
  }

  closeSubcategoryModal(): void {
    this.showSubcategoryModal = false;
  }

  saveSubcategory(): void {
    console.log('Saving subcategory:', this.subcategoryFormData);
    this.closeSubcategoryModal();
  }

  toggleSubcategory(subcategory: Subcategory): void {
    subcategory.expanded = !subcategory.expanded;
  }

  toggleSubcategoryItem(item: SubcategoryItem): void {
    item.checked = !item.checked;
  }

  setSelectionMode(mode: 'Multi' | 'Min1' | 'Max3'): void {
    this.selectionMode = mode;
  }

  onIngredientInput(): void {
    if (this.ingredientSearch.length > 0) {
      this.filteredIngredients = this.ingredientSuggestions.filter((ingredient) =>
        ingredient.toLowerCase().includes(this.ingredientSearch.toLowerCase())
      );
      this.showIngredientDropdown = true;
    } else {
      this.showIngredientDropdown = false;
      this.filteredIngredients = [];
    }
  }

  selectIngredient(ingredient: string): void {
    this.ingredientSearch = ingredient;
    this.showIngredientDropdown = false;
  }

  closeIngredientDropdown(): void {
    setTimeout(() => {
      this.showIngredientDropdown = false;
    }, 200);
  }

  openCreateExtra(): void {
    // Open the extra modal alongside the dish modal
    this.showExtraModal = true;
    console.log('Opening Create Extra modal');
  }
}

