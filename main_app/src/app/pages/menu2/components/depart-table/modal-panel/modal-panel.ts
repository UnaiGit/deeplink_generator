import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface DepartureSection {
  id: number;
  order: string;
  items: string[];
}

export type DepartureModalMode = 'list' | 'delete-section' | 'add-section';

@Component({
  selector: 'app-depart-modal-panel',
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-panel.html',
  styleUrl: './modal-panel.scss',
})
export class DepartModalPanel implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() sections: DepartureSection[] = [];
  @Input() mode: DepartureModalMode = 'list';
  @Input() selectedSection: DepartureSection | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() addSection = new EventEmitter<string>();
  @Output() deleteSection = new EventEmitter<DepartureSection>();
  @Output() updateSections = new EventEmitter<DepartureSection[]>();
  @Output() confirmDelete = new EventEmitter<DepartureSection>();
  @Output() cancelDelete = new EventEmitter<void>();

  newSectionName: string = '';

  ngOnInit(): void {
    if (this.sections.length === 0) {
      this.initializeDefaultSections();
    }
  }

  ngOnChanges(): void {
    if (this.sections.length === 0) {
      this.initializeDefaultSections();
    }
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

  onClose(): void {
    this.isOpen = false;
    this.close.emit();
  }

  onAddSection(): void {
    this.mode = 'add-section';
    this.newSectionName = '';
  }

  onSaveNewSection(): void {
    if (this.newSectionName.trim()) {
      this.addSection.emit(this.newSectionName.trim());
      this.newSectionName = '';
      this.mode = 'list';
    }
  }

  onCancelAdd(): void {
    this.newSectionName = '';
    this.mode = 'list';
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

