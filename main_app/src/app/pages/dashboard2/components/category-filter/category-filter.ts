import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CategoryCounts } from '@/types/dashboard2/category-counts.type';

@Component({
  selector: 'app-category-filter',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './category-filter.html',
  styleUrls: ['./category-filter.scss'],
})
export class CategoryFilterComponent {
  @Input() categories: string[] = [];
  @Input() totalItems = 0;
  @Input() active = 'All';
  @Input() categoryCounts: CategoryCounts = {};
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
}


