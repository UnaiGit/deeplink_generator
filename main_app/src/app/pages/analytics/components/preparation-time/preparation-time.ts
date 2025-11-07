import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

interface PreparationDish {
  rank: number;
  image: string;
  name: string;
  price: string;
  timeChange: string;
}

@Component({
  selector: 'app-preparation-time',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './preparation-time.html',
  styleUrl: './preparation-time.scss',
})
export class PreparationTime {
  dishes: PreparationDish[] = [
    {
      rank: 1,
      image: '/images/food.png',
      name: 'Tuna Saup Spinach with himalaya salt',
      price: '$12.08',
      timeChange: '+12%',
    },
    {
      rank: 2,
      image: '/images/food2.png',
      name: 'Tuna Saup Spinach with himalaya salt',
      price: '$12.08',
      timeChange: '+12%',
    },
    {
      rank: 3,
      image: '/images/drink1.png',
      name: 'Tuna Saup Spinach with himalaya salt',
      price: '$12.08',
      timeChange: '+12%',
    },
    {
      rank: 4,
      image: '/images/desert.png',
      name: 'Tuna Saup Spinach with himalaya salt',
      price: '$12.08',
      timeChange: '+12%',
    },
    {
      rank: 5,
      image: '/images/drink2.png',
      name: 'Tuna Saup Spinach with himalaya salt',
      price: '$12.08',
      timeChange: '+12%',
    },
  ];
}

