import { Component, OnInit, OnChanges, OnDestroy, Input, Output, EventEmitter, HostListener, ElementRef, Renderer2, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
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
export class DishModalPanel implements OnInit, OnChanges, OnDestroy {
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
  showExtraGroupsModal: boolean = false;
  showExtraGroupDropdown: boolean = false;
  selectionMode: 'Multi' | 'Min1' | 'Max3' = 'Multi';

  formData: any = {
    name: '',
    kitchenDepartment: '',
    allergens: [],
    price: 0,
    category: '',
    image: null,
    imagePreview: '',
    description: '',
    extras: [],
    ingredients: [],
  };

  // Validation errors for Dish
  dishValidationErrors: any = {
    name: '',
    kitchenDepartment: '',
    allergens: '',
    price: '',
    category: '',
    image: '',
    description: '',
    extras: '',
    ingredients: '',
  };

  extraFormData: any = {
    name: '',
    price: 0,
    subcategory: '',
    allergens: [],
    inventoryRule: 'deducts',
    imagePreview: '',
    ingredients: [
      { name: 'Smoked Mayonnaise', quantity: '0.2', uom: 'kg' },
      { name: 'Cras just hate', quantity: '0.2', uom: 'kg', isNew: true },
    ],
  };

  // Validation errors for Extra
  extraValidationErrors: any = {
    name: '',
    price: '',
    subcategory: '',
    allergens: '',
    quantity: '',
    uom: '',
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
      color: 'rgba(247, 45, 176, 0.1)', // Pink
      textColor: 'rgba(247, 45, 176, 1)',
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
      color: 'rgba(245, 224, 66, 0.2)', // Yellow
      textColor: 'rgba(184, 134, 11, 1)',
      extras: [
        { name: 'Aioli', selected: true },
        { name: 'Cheese', selected: true },
        { name: 'Smoked Mayonnaise', selected: true },
      ],
    },
  ];

  availableExtraGroups = [
    { id: '1', name: 'Hamburger Sauces', selected: true },
    { id: '2', name: 'Proteins', selected: false },
    { id: '3', name: 'Cooking', selected: false },
    { id: '4', name: 'Carbohydrates', selected: false },
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
  selectedIngredientFromDropdown: string = '';

  // Extras Group
  selectedExtraGroup: string = 'Doneness';
  extraGroupOptions: string[] = ['Doneness', 'Sauce', 'Protein'];

  // Filter data
  filterData = {
    subcategory: 'Topping Pizza',
    allergen: 'Apio',
    allergenAvailable: true,
  };

  private modalElement: HTMLElement | null = null;
  private bodyElement: HTMLElement | null = null;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.bodyElement = this.document.body;
  }

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

    // Move modal to body when open to ensure it overlays everything
    if (this.isOpen && this.bodyElement) {
      setTimeout(() => this.moveModalToBody(), 0);
    } else if (!this.isOpen && this.modalElement) {
      this.removeModalFromBody();
    }
  }

  private moveModalToBody(): void {
    if (!this.bodyElement || !this.el.nativeElement) return;
    
    const modalOverlay = this.el.nativeElement.querySelector('.modal-overlay');
    if (modalOverlay && !this.modalElement) {
      this.modalElement = modalOverlay;
      this.renderer.appendChild(this.bodyElement, modalOverlay);
    }
  }

  private removeModalFromBody(): void {
    if (this.modalElement && this.bodyElement) {
      this.renderer.removeChild(this.bodyElement, this.modalElement);
      this.modalElement = null;
    }
  }

  ngOnDestroy(): void {
    this.removeModalFromBody();
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
      kitchenDepartment: '',
      allergens: [],
      price: 0,
      category: '',
      image: null,
      imagePreview: '',
      description: '',
      extras: [],
      ingredients: [],
    };
    this.dishValidationErrors = {
      name: '',
      kitchenDepartment: '',
      allergens: '',
      price: '',
      category: '',
      image: '',
      description: '',
      extras: '',
      ingredients: '',
    };
    this.extraValidationErrors = {
      name: '',
      price: '',
      subcategory: '',
      allergens: '',
      quantity: '',
      uom: '',
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

  onExtraFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.extraFormData.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  triggerExtraFileInput(): void {
    document.getElementById('extraFileInput')?.click();
  }

  validateDishForm(): boolean {
    let isValid = true;
    this.dishValidationErrors = {
      name: '',
      kitchenDepartment: '',
      allergens: '',
      price: '',
      category: '',
      image: '',
      description: '',
      extras: '',
      ingredients: '',
    };

    // Name validation
    if (!this.formData.name || this.formData.name.trim() === '') {
      this.dishValidationErrors.name = 'Dish name cannot be empty.';
      isValid = false;
    }

    // Kitchen Department validation
    if (!this.formData.kitchenDepartment || this.formData.kitchenDepartment === '') {
      this.dishValidationErrors.kitchenDepartment = 'Please select a kitchen department.';
      isValid = false;
    }

    // Allergens validation
    const selectedAllergens = this.allergens.filter(a => a.selected);
    if (selectedAllergens.length === 0) {
      this.dishValidationErrors.allergens = 'At least one allergen must be specified or confirm \'None\'.';
      isValid = false;
    }

    // Price validation
    if (this.formData.price === null || this.formData.price === undefined) {
      this.dishValidationErrors.price = 'Base price must be greater than 0.';
      isValid = false;
    } else if (this.formData.price <= 0) {
      this.dishValidationErrors.price = 'Base price must be greater than 0.';
      isValid = false;
    }

    // Category validation
    if (!this.formData.category || this.formData.category === '') {
      this.dishValidationErrors.category = 'Select a category for this dish.';
      isValid = false;
    }

    // Image validation
    if (!this.formData.imagePreview) {
      this.dishValidationErrors.image = 'Upload a valid image file (JPG, PNG, max 2MB).';
      isValid = false;
    }

    // Description validation
    if (this.formData.description && this.formData.description.length > 200) {
      this.dishValidationErrors.description = 'Description cannot exceed 200 characters.';
      isValid = false;
    }

    return isValid;
  }

  validateExtraForm(): boolean {
    let isValid = true;
    this.extraValidationErrors = {
      name: '',
      price: '',
      subcategory: '',
      allergens: '',
      quantity: '',
      uom: '',
    };

    // Name validation
    if (!this.extraFormData.name || this.extraFormData.name.trim() === '') {
      this.extraValidationErrors.name = 'Extra name is required.';
      isValid = false;
    }

    // Price validation
    if (this.extraFormData.price === null || this.extraFormData.price === undefined) {
      this.extraValidationErrors.price = 'Enter a valid price adjustment (can be 0 or higher)';
      isValid = false;
    }

    // Allergens validation
    const selectedAllergens = this.allergens.filter(a => a.selected);
    if (selectedAllergens.length === 0) {
      this.extraValidationErrors.allergens = 'Mark any allergens or confirm \'None\'.';
      isValid = false;
    }

    // Ingredient validation for search ingredients section
    if (this.ingredientSearch && !this.ingredientQuantity) {
      this.extraValidationErrors.quantity = 'must be greater than 0';
      isValid = false;
    }

    if (this.ingredientSearch && !this.ingredientUom) {
      this.extraValidationErrors.uom = 'Please select a unit';
      isValid = false;
    }

    return isValid;
  }

  onSave(): void {
    // Validate the dish form
    if (!this.validateDishForm()) {
      return;
    }

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

  onSaveExtra(): void {
    // Validate the extra form
    if (!this.validateExtraForm()) {
      return;
    }

    this.showSuccessMessage = true;
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 3000);
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

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  toggleSubcategoryDropdown(): void {
    this.showSubcategoryDropdown = !this.showSubcategoryDropdown;
  }

  toggleExtraGroupDropdown(): void {
    this.showExtraGroupDropdown = !this.showExtraGroupDropdown;
  }

  selectExtraGroup(group: string): void {
    this.selectedExtraGroup = group;
    this.showExtraGroupDropdown = false;
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
    this.selectedIngredientFromDropdown = ingredient;
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

  openExtraGroupsModal(): void {
    this.showExtraGroupsModal = true;
  }

  closeExtraGroupsModal(): void {
    this.showExtraGroupsModal = false;
  }

  toggleExtraGroup(group: any): void {
    group.selected = !group.selected;
  }
}

