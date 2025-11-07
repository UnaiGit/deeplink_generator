import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of, delay } from 'rxjs';

export interface Dish {
  id: number;
  productName: string;
  image: string;
  category: string;
  extras: number;
  price: number;
  available: boolean;
}

@Component({
  selector: 'app-dishes-table',
  imports: [CommonModule],
  templateUrl: './dishes-table.html',
  styleUrl: './dishes-table.scss',
})
export class DishesTable implements OnInit {
  @Output() addClick = new EventEmitter<void>();
  @Output() editClick = new EventEmitter<Dish>();
  @Output() deleteClick = new EventEmitter<Dish>();

  dishes: Dish[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 100;

  constructor() {}

  ngOnInit(): void {
    this.loadDishes();
  }

  loadDishes(): void {
    // Mock API call - simulating async behavior
    this.getDishes().subscribe((data) => {
      this.dishes = data;
    });
  }

  getDishes(): Observable<Dish[]> {
    // Mock data matching the image
    const mockDishes: Dish[] = [
      {
        id: 1,
        productName: 'Spaghetti in Meat...',
        image: '/images/food.png',
        category: 'Main Course',
        extras: 1,
        price: 3.76,
        available: true,
      },
      {
        id: 2,
        productName: 'Grilled Salmon',
        image: '/images/food2.png',
        category: 'Main Course',
        extras: 3,
        price: 4.5,
        available: false,
      },
      {
        id: 3,
        productName: 'Caesar Salad',
        image: '/images/food.png',
        category: 'Starters',
        extras: 2,
        price: 4.0,
        available: false,
      },
      {
        id: 4,
        productName: 'Iced Latte',
        image: '/images/drink1.png',
        category: 'Drinks',
        extras: 4,
        price: 3.0,
        available: true,
      },
      {
        id: 5,
        productName: 'Strawberry Banan...',
        image: '/images/desert.png',
        category: 'Desserts',
        extras: 3,
        price: 4.0,
        available: true,
      },
      {
        id: 6,
        productName: 'Spaghetti in Meat...',
        image: '/images/food.png',
        category: 'Desserts',
        extras: 1,
        price: 4.0,
        available: true,
      },
      {
        id: 7,
        productName: 'Spaghetti in Meat...',
        image: '/images/food.png',
        category: 'Main Course',
        extras: 2,
        price: 3.76,
        available: true,
      },
      {
        id: 8,
        productName: 'Spaghetti in Meat...',
        image: '/images/food.png',
        category: 'Main Course',
        extras: 3,
        price: 5.99,
        available: true,
      },
    ];

    // Simulate API delay
    return of(mockDishes).pipe(delay(300));
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'Main Course': '#d1fae5',
      Starters: '#dbeafe',
      Drinks: '#fef3c7',
      Desserts: '#fce7f3',
    };
    return colors[category] || '#e5e7eb';
  }

  getCategoryTextColor(category: string): string {
    const colors: { [key: string]: string } = {
      'Main Course': '#065f46',
      Starters: '#1e40af',
      Drinks: '#92400e',
      Desserts: '#9f1239',
    };
    return colors[category] || '#374151';
  }

  toggleAvailable(dish: Dish): void {
    dish.available = !dish.available;
  }

  editDish(dish: Dish): void {
    this.editClick.emit(dish);
  }

  onAddClick(): void {
    this.addClick.emit();
  }

  deleteDish(dish: Dish): void {
    this.deleteClick.emit(dish);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadDishes();
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
    this.loadDishes();
  }
}
