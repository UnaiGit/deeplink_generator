import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export interface CategoryItem {
  id: string;
  label: string;
  icon?: string;
  count?: number;
}

@Component({
  selector: 'app-category-filter',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './category-filter.html',
  styleUrls: ['./category-filter.scss'],
})
export class CategoryFilterComponent {
  // Legacy support - can use simple string array
  @Input() categories: string[] = [];
  
  // New flexible approach - use CategoryItem array
  @Input() items: CategoryItem[] = [];
  
  @Input() totalItems = 0;
  @Input() active = 'All';
  @Input() categoryCounts: { [key: string]: number } = {};
  
  // Customizable labels
  @Input() allLabel = 'All Menu';
  @Input() itemsLabel = 'Items';
  @Input() allIcon = '/icons/categorey.svg';
  
  @Output() changed = new EventEmitter<string>();

  select(c: string) {
    this.active = c;
    this.changed.emit(c);
  }

  getCategoryIcon(category: string): string {
    const iconMap: { [key: string]: string } = {
      'Foods': '/icons/foods.png',
      'Desserts': '/icons/deserts.png',
      'Drinks': '/icons/drinks.png',
    };
    return iconMap[category] || '/icons/categorey.svg';
  }

  getCategoryCount(category: string): number {
    if (category === 'All') {
      return this.totalItems;
    }
    return this.categoryCounts[category] || 0;
  }

  // Get items to display - supports both old and new API
  get displayItems(): CategoryItem[] {
    if (this.items && this.items.length > 0) {
      return this.items;
    }
    // Fallback to legacy categories array
    return this.categories.map(cat => ({
      id: cat,
      label: cat,
      icon: this.getCategoryIcon(cat),
      count: this.getCategoryCount(cat)
    }));
  }
}

