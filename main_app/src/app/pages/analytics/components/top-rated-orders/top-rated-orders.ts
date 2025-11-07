import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

interface TopRatedOrder {
  rank: number;
  image: string;
  name: string;
  price: string;
  tag: string;
  salesCount: number;
  salesChange: string;
  rating?: number;
  reviews?: number;
  likes?: string;
}

@Component({
  selector: 'app-top-rated-orders',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './top-rated-orders.html',
  styleUrl: './top-rated-orders.scss',
})
export class TopRatedOrders {
  selectedPeriod: string = 'Monthly';

  topRatedOrders: TopRatedOrder[] = [
    {
      rank: 4,
      image: '/images/food.png',
      name: 'Tuna Saup Spinach with himalaya salt',
      price: '$12.08',
      tag: 'Marketing',
      salesCount: 524,
      salesChange: '+12%',
    },
    {
      rank: 5,
      image: '/images/food2.png',
      name: 'Tuna Saup Spinach with himalaya salt',
      price: '$12.08',
      tag: 'Marketing',
      salesCount: 524,
      salesChange: '+12%',
    },
    {
      rank: 6,
      image: '/images/drink1.png',
      name: 'Tuna Saup Spinach with himalaya salt',
      price: '$12.08',
      tag: 'Marketing',
      salesCount: 524,
      salesChange: '+12%',
    },
  ];

  featuredOrders: TopRatedOrder[] = [
    {
      rank: 1,
      image: '/images/food.png',
      name: 'Tuna Saup Spinach with himalaya salt',
      price: '$12.08',
      tag: 'Marketing',
      salesCount: 524,
      salesChange: '+12%',
      rating: 4.9,
      reviews: 451,
      likes: '250k',
    },
    {
      rank: 2,
      image: '/images/drink1.png',
      name: 'Tuna Saup Spinach with himalaya salt',
      price: '$12.08',
      tag: 'Marketing',
      salesCount: 524,
      salesChange: '+12%',
      rating: 4.9,
      reviews: 451,
      likes: '250k',
    },
    {
      rank: 3,
      image: '/images/food2.png',
      name: 'Tuna Saup Spinach with himalaya salt',
      price: '$12.08',
      tag: 'Marketing',
      salesCount: 524,
      salesChange: '+12%',
      rating: 4.9,
      reviews: 451,
      likes: '250k',
    },
  ];

  onPeriodChange(period: string) {
    this.selectedPeriod = period;
  }
}

