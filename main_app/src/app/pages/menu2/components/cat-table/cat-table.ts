import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, of, delay } from 'rxjs';
import { ModalPanel } from './modal-panel/modal-panel';
import { Category } from '@/types/interfaces/menu2/category.interface';
import { ModalMode } from '@/types/menu2/modes.type';

export { }

@Component({
  selector: 'app-cat-table',
  imports: [CommonModule, TranslateModule, ModalPanel],
  templateUrl: './cat-table.html',
  styleUrl: './cat-table.scss',
})
export class CatTable implements OnInit {
  @Output() addClick = new EventEmitter<void>();
  @Output() editClick = new EventEmitter<Category>();
  @Output() deleteClick = new EventEmitter<Category>();

  modalOpen = false;
  modalMode: ModalMode = 'add';
  selectedCategory: Category | null = null;
  showCategoriesList = false;

  categories: Category[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 100;

  constructor() {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.getCategories().subscribe((data) => {
      this.categories = data;
    });
  }

  getCategories(): Observable<Category[]> {
    const mockCategories: Category[] = [
      {
        id: 1,
        name: 'Starters',
        itemsNumber: 1,
        price: 3.76,
        available: true,
      },
      {
        id: 2,
        name: 'Fish',
        itemsNumber: 3,
        price: 4.5,
        available: false,
      },
      {
        id: 3,
        name: 'Meats',
        itemsNumber: 2,
        price: 4.0,
        available: true,
      },
      {
        id: 4,
        name: 'Paste',
        itemsNumber: 4,
        price: 3.0,
        available: true,
      },
      {
        id: 5,
        name: 'Wine',
        itemsNumber: 1,
        price: 4.0,
        available: false,
      },
      {
        id: 6,
        name: 'Drinks',
        itemsNumber: 2,
        price: 3.76,
        available: true,
      },
      {
        id: 7,
        name: 'Desser...',
        itemsNumber: 3,
        price: 5.99,
        available: true,
      },
    ];

    return of(mockCategories).pipe(delay(300));
  }

  toggleAvailable(category: Category): void {
    category.available = !category.available;
  }

  editCategory(category: Category): void {
    this.selectedCategory = category;
    this.modalMode = 'edit';
    this.modalOpen = true;
    this.editClick.emit(category);
  }

  deleteCategory(category: Category): void {
    this.selectedCategory = category;
    this.modalMode = 'delete';
    this.modalOpen = true;
    this.deleteClick.emit(category);
  }

  onAddClick(): void {
    this.selectedCategory = null;
    this.modalMode = 'add';
    this.modalOpen = true;
    this.addClick.emit();
  }

  openCategoriesList(): void {
    this.showCategoriesList = true;
    this.modalOpen = true;
  }

  openAddFromList(): void {
    this.showCategoriesList = false;
    this.selectedCategory = null;
    this.modalMode = 'add';
  }

  editCategoryFromList(category: Category): void {
    this.showCategoriesList = false;
    this.selectedCategory = category;
    this.modalMode = 'edit';
  }

  deleteCategoryFromList(category: Category): void {
    this.showCategoriesList = false;
    this.selectedCategory = category;
    this.modalMode = 'delete';
  }

  onUpdateCategories(): void {
    console.log('Categories updated');
    this.onModalClose();
  }

  onModalClose(): void {
    this.modalOpen = false;
    this.selectedCategory = null;
    this.showCategoriesList = false;
  }

  onModalSave(data: any): void {
    console.log('Category saved:', data);
    // Handle save logic here
    this.onModalClose();
  }

  onModalDelete(data: any): void {
    console.log('Category deleted:', data);
    // Handle delete logic here
    this.onModalClose();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadCategories();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get pages(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push(-1); // Ellipsis
      pages.push(7);
    }
    return pages;
  }

  changeItemsPerPage(value: number): void {
    this.itemsPerPage = value;
    this.currentPage = 1;
    this.loadCategories();
  }
}
