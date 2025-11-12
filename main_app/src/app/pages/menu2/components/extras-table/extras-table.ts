import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, of, delay } from 'rxjs';
import { ExtrasModalPanel } from './modal-panel/modal-panel';
import { Extra } from '@/types/interfaces/menu2/extra.interface';
import { ModalMode } from '@/types/menu2/modes.type';

export { }

@Component({
  selector: 'app-extras-table',
  imports: [CommonModule, TranslateModule, ExtrasModalPanel],
  templateUrl: './extras-table.html',
  styleUrl: './extras-table.scss',
})
export class ExtrasTable implements OnInit {
  @Output() addClick = new EventEmitter<void>();
  @Output() editClick = new EventEmitter<Extra>();
  @Output() deleteClick = new EventEmitter<Extra>();

  modalOpen = false;
  modalMode: ModalMode = 'add';
  selectedExtra: Extra | null = null;
  showExtrasList = false;
  showSubcategoryModal = false;
  selectedExtrasForEditing: string[] = [];
  availableExtras: string[] = [
    'Brave Saouce',
    'Rum Sauce',
    'Mustard',
    'Chilli',
    'Ketchup',
    'Alioli',
    'Cheese',
    'Smoked Mayonnaise',
  ];

  extras: Extra[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 100;

  constructor() {}

  ngOnInit(): void {
    this.loadExtras();
  }

  loadExtras(): void {
    this.getExtras().subscribe((data) => {
      this.extras = data;
    });
  }

  getExtras(): Observable<Extra[]> {
    const mockExtras: Extra[] = [
      {
        id: 1,
        name: 'Willows',
        defaultExtras: ['Barbecue', 'Mayonnaise', 'Ketchup'],
      },
      {
        id: 2,
        name: 'Bread',
        defaultExtras: ['Brioche', 'Wholemeal', 'Mold'],
      },
      {
        id: 3,
        name: 'Cooking',
        defaultExtras: ['Medium', 'Rare', 'Well Done'],
      },
      {
        id: 4,
        name: 'Cheese',
        defaultExtras: ['Cheddar', 'Blue'],
      },
      {
        id: 5,
        name: 'Complement',
        defaultExtras: ['Pickles', 'Lettuce', 'Sundried Tom...'],
      },
      {
        id: 6,
        name: 'Carbohydrates',
        defaultExtras: ['Rice', 'Quinoa', 'Wheat', 'Seeds'],
      },
    ];

    return of(mockExtras).pipe(delay(300));
  }

  editExtra(extra: Extra): void {
    this.selectedExtra = extra;
    this.modalMode = 'edit';
    this.modalOpen = true;
    this.showExtrasList = false;
    this.editClick.emit(extra);
  }

  onAddClick(): void {
    this.selectedExtra = null;
    this.modalMode = 'add';
    this.modalOpen = true;
    this.showExtrasList = false;
    // Initialize with default selected extras for display
    if (this.selectedExtrasForEditing.length === 0) {
      this.selectedExtrasForEditing = [...this.availableExtras];
    }
    this.addClick.emit();
  }

  deleteExtra(extra: Extra): void {
    this.selectedExtra = extra;
    this.modalMode = 'delete';
    this.modalOpen = true;
    this.deleteClick.emit(extra);
  }

  onModalClose(): void {
    this.modalOpen = false;
    this.selectedExtra = null;
    this.showExtrasList = false;
    this.showSubcategoryModal = false;
    this.selectedExtrasForEditing = [];
  }

  onSaveSubcategory(data: any): void {
    console.log('Subcategory saved:', data);
    // Handle subcategory save logic here
    this.showSubcategoryModal = false;
  }

  toggleExtraSelection(extra: string): void {
    const index = this.selectedExtrasForEditing.indexOf(extra);
    if (index > -1) {
      this.selectedExtrasForEditing.splice(index, 1);
    } else {
      this.selectedExtrasForEditing.push(extra);
    }
  }

  onModalSave(data: any): void {
    console.log('Extra saved:', data);
    // Handle save logic here
    this.onModalClose();
  }

  onModalDelete(data: any): void {
    console.log('Extra deleted:', data);
    // Handle delete logic here
    this.onModalClose();
  }

  openExtrasList(): void {
    this.showExtrasList = true;
    this.modalOpen = true;
  }

  openExtrasListForExtra(extra: Extra): void {
    this.selectedExtra = extra;
    this.selectedExtrasForEditing = [...extra.defaultExtras];
    this.showExtrasList = true;
    this.modalOpen = true;
  }

  openAddFromList(): void {
    // If called from extras list, close it
    if (this.showExtrasList) {
      this.showExtrasList = false;
      this.selectedExtra = null;
      this.modalMode = 'add';
    } else {
      // If called from "Add subcategory" button, open subcategory modal
      this.showSubcategoryModal = true;
    }
  }

  editExtraFromList(extra: any): void {
    this.showExtrasList = false;
    this.selectedExtra = extra;
    this.modalMode = 'edit';
  }

  deleteExtraFromList(extra: any): void {
    this.showExtrasList = false;
    this.selectedExtra = extra;
    this.modalMode = 'delete';
  }

  onUpdateExtras(): void {
    if (this.selectedExtra) {
      this.selectedExtra.defaultExtras = [...this.selectedExtrasForEditing];
      console.log('Extras updated for:', this.selectedExtra.name, this.selectedExtrasForEditing);
    }
    this.onModalClose();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadExtras();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get pages(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 11) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 6) {
        for (let i = 1; i <= 7; i++) {
          pages.push(i);
        }
        pages.push(-1); // Ellipsis
        pages.push(total - 1);
        pages.push(total);
      } else if (current >= total - 5) {
        pages.push(1);
        pages.push(2);
        pages.push(-1); // Ellipsis
        for (let i = total - 6; i <= total; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push(2);
        pages.push(-1); // Ellipsis
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push(-1); // Ellipsis
        pages.push(total - 1);
        pages.push(total);
      }
    }
    return pages;
  }

  changeItemsPerPage(value: number): void {
    this.itemsPerPage = value;
    this.currentPage = 1;
    this.loadExtras();
  }
}
