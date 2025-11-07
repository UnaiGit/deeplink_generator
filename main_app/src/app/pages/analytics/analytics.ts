import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Gensales } from './components/gensales/gensales';
import { Taxes } from './components/taxes/taxes';
import { BenefitsCategory } from './components/benefits-category/benefits-category';
import { PremisesOccupancy } from './components/premises-occupancy/premises-occupancy';
import { PreparationTime } from './components/preparation-time/preparation-time';
import { Poporders } from './components/poporders/poporders';
import { TopRatedOrders } from './components/top-rated-orders/top-rated-orders';
import { FoodStatus } from './components/food-status/food-status';
import { RequiredIngredients } from './components/required-ingredients/required-ingredients';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    TranslateModule,
    Gensales,
    Taxes,
    BenefitsCategory,
    PremisesOccupancy,
    PreparationTime,
    Poporders,
    TopRatedOrders,
    FoodStatus,
    RequiredIngredients,
  ],
  templateUrl: './analytics.html',
  styleUrl: './analytics.scss',
})
export class Analytics {

}
