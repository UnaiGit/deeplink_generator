import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, of, delay } from 'rxjs';
import { DepartModalPanel } from './modal-panel/modal-panel';
import { DepartureSection } from '@/types/interfaces/menu2/modals';
import { Departure } from '@/types/interfaces/menu2/departure.interface';

export { }

@Component({
  selector: 'app-depart-table',
  imports: [CommonModule, TranslateModule, DepartModalPanel],
  templateUrl: './depart-table.html',
  styleUrl: './depart-table.scss',
})
export class DepartTable implements OnInit {
  @Output() addClick = new EventEmitter<void>();
  @Output() editClick = new EventEmitter<Departure>();
  @Output() deleteClick = new EventEmitter<Departure>();

  departures: Departure[] = [];
  modalOpen = false;
  sections: DepartureSection[] = [];
  modalMode: 'list' | 'delete-section' | 'add-section' = 'list';
  selectedSection: DepartureSection | null = null;
  availableCategories: string[] = ['Starters', 'Fish', 'Meats', 'Paste', 'Wine', 'Drinks', 'Desserts', 'Atlantic'];

  constructor() {}

  ngOnInit(): void {
    this.loadDepartures();
    this.initializeSections();
  }

  initializeSections(): void {
    this.sections = [
      { id: 1, order: '1st', items: ['Starters'] },
      { id: 2, order: '2nd', items: ['Meats', 'Fish'] },
      { id: 3, order: '3rd', items: ['Desserts'] },
    ];
  }

  loadDepartures(): void {
    this.getDepartures().subscribe((data) => {
      this.departures = data;
    });
  }

  getDepartures(): Observable<Departure[]> {
    const mockDepartures: Departure[] = [
      {
        id: 1,
        order: '1st',
        name: 'Starter',
      },
      {
        id: 2,
        order: '2nd',
        name: 'Main Course',
      },
      {
        id: 3,
        order: '3rd',
        name: 'Desserts',
      },
    ];

    return of(mockDepartures).pipe(delay(300));
  }

  editDeparture(departure: Departure): void {
    this.editClick.emit(departure);
  }

  onAddClick(): void {
    this.modalOpen = true;
    this.addClick.emit();
  }

  deleteDeparture(departure: Departure): void {
    this.deleteClick.emit(departure);
  }

  onModalClose(): void {
    this.modalOpen = false;
  }

  onAddSection(sectionName: string): void {
    const newOrder = this.getNextOrder();
    const newSection: DepartureSection = {
      id: this.sections.length + 1,
      order: newOrder,
      items: [],
    };
    this.sections = [...this.sections, newSection];
    this.modalMode = 'list';
  }

  onImportCategories(event: { sectionId: number; categories: string[] }): void {
    const sectionIndex = this.sections.findIndex((s) => s.id === event.sectionId);
    if (sectionIndex > -1) {
      this.sections[sectionIndex].items = [
        ...this.sections[sectionIndex].items,
        ...event.categories.filter((cat) => !this.sections[sectionIndex].items.includes(cat)),
      ];
    }
  }

  onDeleteSection(section: DepartureSection): void {
    this.selectedSection = section;
    this.modalMode = 'delete-section';
  }

  onConfirmDeleteSection(section: DepartureSection): void {
    this.sections = this.sections.filter((s) => s.id !== section.id);
    this.selectedSection = null;
    this.modalMode = 'list';
  }

  onCancelDeleteSection(): void {
    this.selectedSection = null;
    this.modalMode = 'list';
  }

  onUpdateSections(sections: DepartureSection[]): void {
    this.sections = sections;
    console.log('Sections updated:', sections);
    // Here you can add API call to save sections
  }

  getNextOrder(): string {
    const orders = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];
    const usedOrders = this.sections.map((s) => s.order);
    for (const order of orders) {
      if (!usedOrders.includes(order)) {
        return order;
      }
    }
    return `${this.sections.length + 1}th`;
  }
}
