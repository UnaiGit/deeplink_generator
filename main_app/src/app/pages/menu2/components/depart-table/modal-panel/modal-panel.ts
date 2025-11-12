import { Component, Input, Output, EventEmitter, OnInit, OnChanges, OnDestroy, HostListener, ElementRef, Renderer2, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DepartureSection } from '@/types/interfaces/menu2/modals';

import { DepartureModalMode } from '@/types/menu2/modes.type';
export type { DepartureModalMode };

@Component({
  selector: 'app-depart-modal-panel',
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-panel.html',
  styleUrl: './modal-panel.scss',
})
export class DepartModalPanel implements OnInit, OnChanges, OnDestroy {
  @Input() isOpen: boolean = false;
  @Input() sections: DepartureSection[] = [];
  @Input() mode: DepartureModalMode = 'list';
  @Input() selectedSection: DepartureSection | null = null;
  @Input() availableCategories: string[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() addSection = new EventEmitter<string>();
  @Output() deleteSection = new EventEmitter<DepartureSection>();
  @Output() updateSections = new EventEmitter<DepartureSection[]>();
  @Output() confirmDelete = new EventEmitter<DepartureSection>();
  @Output() cancelDelete = new EventEmitter<void>();
  @Output() importCategories = new EventEmitter<{ sectionId: number; categories: string[] }>();

  newSectionName: string = '';
  showAddFormInList: boolean = false;
  showCategorySelector: { [key: number]: boolean } = {};
  selectedCategoriesForImport: { [key: number]: string[] } = {};

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
    if (this.sections.length === 0) {
      this.initializeDefaultSections();
    }
  }

  ngOnChanges(): void {
    if (this.sections.length === 0) {
      this.initializeDefaultSections();
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

  initializeDefaultSections(): void {
    this.sections = [
      { id: 1, order: '1st', items: ['Starters'] },
      { id: 2, order: '2nd', items: ['Meats', 'Fish'] },
      { id: 3, order: '3rd', items: ['Desserts'] },
    ];
  }

  getTitle(): string {
    if (this.mode === 'delete-section') {
      return 'Do you want to delete this section?';
    }
    if (this.mode === 'add-section') {
      return 'Add Section';
    }
    return 'Order of departure';
  }

  getDeleteMessage(): string {
    return 'Deleting this section will remove it permanently';
  }

  isDeleteMode(): boolean {
    return this.mode === 'delete-section';
  }

  isAddMode(): boolean {
    return this.mode === 'add-section';
  }

  getAvailableCategoriesForSection(section: DepartureSection): string[] {
    // Return categories that are not already in the section
    return this.availableCategories.filter((cat) => !section.items.includes(cat));
  }

  getCategoryIcon(category: string): string {
    const iconMap: { [key: string]: string } = {
      'Starters': '🍲', // Soup ladle icon
      'Fish': '🐟',
      'Meats': '🥩',
      'Paste': '🍝',
      'Wine': '🍷',
      'Drinks': '☕', // Coffee cup icon
      'Desserts': '🍰',
      'Atlantic': '🌊',
    };
    return iconMap[category] || '📦';
  }

  onClose(): void {
    this.isOpen = false;
    this.showAddFormInList = false;
    this.newSectionName = '';
    this.showCategorySelector = {};
    this.selectedCategoriesForImport = {};
    this.close.emit();
  }

  onAddSection(): void {
    this.showAddFormInList = true;
    this.newSectionName = '';
  }

  onSaveNewSection(): void {
    if (this.newSectionName.trim()) {
      this.addSection.emit(this.newSectionName.trim());
      this.newSectionName = '';
      this.showAddFormInList = false;
    }
  }

  onCancelAdd(): void {
    this.newSectionName = '';
    this.showAddFormInList = false;
  }

  onImportCategories(section: DepartureSection): void {
    this.showCategorySelector[section.id] = !this.showCategorySelector[section.id];
    if (!this.selectedCategoriesForImport[section.id]) {
      this.selectedCategoriesForImport[section.id] = [];
    }
  }

  toggleCategorySelection(sectionId: number, category: string): void {
    if (!this.selectedCategoriesForImport[sectionId]) {
      this.selectedCategoriesForImport[sectionId] = [];
    }
    const index = this.selectedCategoriesForImport[sectionId].indexOf(category);
    if (index > -1) {
      this.selectedCategoriesForImport[sectionId].splice(index, 1);
    } else {
      this.selectedCategoriesForImport[sectionId].push(category);
    }
  }

  isCategorySelected(sectionId: number, category: string): boolean {
    return this.selectedCategoriesForImport[sectionId]?.includes(category) || false;
  }

  onConfirmImportCategories(section: DepartureSection): void {
    const selected = this.selectedCategoriesForImport[section.id] || [];
    if (selected.length > 0) {
      this.importCategories.emit({
        sectionId: section.id,
        categories: selected,
      });
    }
    this.showCategorySelector[section.id] = false;
    this.selectedCategoriesForImport[section.id] = [];
  }

  onCancelImportCategories(sectionId: number): void {
    this.showCategorySelector[sectionId] = false;
    this.selectedCategoriesForImport[sectionId] = [];
  }

  onDeleteSection(section: DepartureSection): void {
    this.deleteSection.emit(section);
  }

  onConfirmDelete(): void {
    if (this.selectedSection) {
      this.confirmDelete.emit(this.selectedSection);
    }
  }

  onCancelDelete(): void {
    this.cancelDelete.emit();
  }

  onUpdateSections(): void {
    this.updateSections.emit(this.sections);
    this.onClose();
  }

  getSectionTitle(section: DepartureSection): string {
    return `${section.order} Section`;
  }
}

