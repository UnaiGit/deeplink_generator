import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PopularOrder } from '@/types/interfaces/analytics/popular-order.interface';

@Component({
  selector: 'app-poporders',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './poporders.html',
  styleUrl: './poporders.scss',
})
export class Poporders {
  selectedSort: string = 'Upward';

  popularOrders: PopularOrder[] = [
    {
      rank: 1,
      image: '/images/food.png',
      name: 'Tuna Saup Spinach with himalaya salt',
      price: '$12.08',
      tag: 'Marketing',
      salesCount: 524,
      salesChange: '+12%',
    },
    {
      rank: 2,
      image: '/images/food2.png',
      name: 'Tuna Saup Spinach with himalaya salt',
      price: '$12.08',
      tag: 'Marketing',
      salesCount: 524,
      salesChange: '+12%',
    },
    {
      rank: 3,
      image: '/images/drink1.png',
      name: 'Tuna Saup Spinach with himalaya salt',
      price: '$12.08',
      tag: 'Marketing',
      salesCount: 524,
      salesChange: '+12%',
    },
    {
      rank: 4,
      image: '/images/desert.png',
      name: 'Tuna Saup Spinach with himalaya salt',
      price: '$12.08',
      tag: 'Marketing',
      salesCount: 524,
      salesChange: '+12%',
    },
    {
      rank: 5,
      image: '/images/drink2.png',
      name: 'Tuna Saup Spinach with himalaya salt',
      price: '$12.08',
      tag: 'Marketing',
      salesCount: 524,
      salesChange: '+12%',
    },
  ];

  onSortChange(sort: string) {
    this.selectedSort = sort;
    // You can update sorting logic here
  }
}
