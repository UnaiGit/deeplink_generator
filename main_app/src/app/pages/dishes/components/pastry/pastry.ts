import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { KitchenColumn } from '@/types/interfaces/dishes/kitchen.interface';

export { }

@Component({
  selector: 'app-pastry',
  imports: [CommonModule, TranslateModule],
  templateUrl: './pastry.html',
  styleUrl: './pastry.scss',
})
export class Pastry {
  kitchenName = 'Pastry';
  capacity = 2;
  staff = 'Chris, Lily';

  columns: KitchenColumn[] = [
    {
      id: 'queued',
      label: 'Queued',
      count: 3,
      icon: '/icons/history.svg',
      items: [
        {
          id: 'q1',
          dishName: 'Strawberry Banana Swirl',
          table: 'T02',
          priority: 1,
          estimatedTime: '15 mins',
          note: 'no butter'
        }
      ]
    },
    {
      id: 'cooking',
      label: 'Cooking',
      count: 1,
      icon: '/icons/chefhat.svg',
      items: [
        {
          id: 'c1',
          dishName: 'Strawberry Banana Swirl',
          table: 'T02',
          priority: 1,
          estimatedTime: '15 mins',
          note: 'no butter'
        }
      ]
    },
    {
      id: 'ready',
      label: 'Ready',
      count: 2,
      icon: '/icons/ready.svg',
      items: [
        {
          id: 'r1',
          dishName: 'Strawberry Banana Swirl',
          table: 'T02',
          priority: 1,
          estimatedTime: '15 mins',
          note: 'no butter'
        }
      ]
    }
  ];

  onCancel(columnId: string, itemId: string): void {
    console.log('Cancel:', columnId, itemId);
  }

  onRemake(columnId: string, itemId: string): void {
    console.log('Remake:', columnId, itemId);
  }

  onNext(columnId: string, itemId: string): void {
    console.log('Next:', columnId, itemId);
  }

  onPicked(columnId: string, itemId: string): void {
    console.log('Picked:', columnId, itemId);
  }
}
