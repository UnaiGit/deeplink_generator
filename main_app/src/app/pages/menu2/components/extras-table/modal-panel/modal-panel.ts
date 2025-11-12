import { Component, Input, Output, EventEmitter, OnInit, OnChanges, OnDestroy, HostListener, ElementRef, Renderer2, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ModalMode } from '@/types/menu2/modes.type';

import { Allergen, Ingredient } from '@/types/interfaces/menu2/modals';

@Component({
  selector: 'app-extras-modal-panel',
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-panel.html',
  styleUrl: './modal-panel.scss',
})
export class ExtrasModalPanel implements OnInit, OnChanges, OnDestroy {
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
  showFormatDropdown: boolean = false;

  private modalElement: HTMLElement | null = null;
  private bodyElement: HTMLElement | null = null;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.bodyElement = this.document.body;
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

