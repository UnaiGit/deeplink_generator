import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Ingredient } from '@/types/interfaces/analytics/ingredient.interface';

@Component({
  selector: 'app-required-ingredients',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './required-ingredients.html',
  styleUrl: './required-ingredients.scss',
})
export class RequiredIngredients {
  selectedSort: string = 'Upward';

  ingredients: Ingredient[] = [
    {
      image: '/images/food.png',
      name: 'Potatoes',
      currentStock: '20kg',
      usageTag: 'Used in 10 Dishes',
      requiredQuantity: '4kg',
    },
    {
      image: '/images/food2.png',
      name: 'Beef Tenderloin',
      currentStock: '32kg',
      usageTag: 'Used in 10 Dishes',
      requiredQuantity: '12kg',
    },
    {
      image: '/images/drink1.png',
      name: 'Milk',
      currentStock: '40L',
      usageTag: 'Used in 10 Dishes',
      requiredQuantity: '25L',
    },
    {
      image: '/images/desert.png',
      name: 'Bread',
      currentStock: '9kg',
      usageTag: 'Used in 10 Dishes',
      requiredQuantity: '5kg',
    },
    {
      image: '/images/drink2.png',
      name: 'Sea Bass',
      currentStock: '8kg',
      usageTag: 'Used in 10 Dishes',
      requiredQuantity: '2kg',
    },
  ];

  onSortChange(sort: string) {
    this.selectedSort = sort;
  }
}

