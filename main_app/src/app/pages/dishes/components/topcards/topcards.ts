import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { StatCard } from '@/types/interfaces/dishes/stat-card.interface';

export { }

@Component({
  selector: 'app-topcards',
  imports: [CommonModule, TranslateModule],
  templateUrl: './topcards.html',
  styleUrl: './topcards.scss',
})
export class Topcards {
  cards: StatCard[] = [
    {
      label: 'Total tickets',
      value: 4,
      icon: '/icons/chefhat.svg',
      iconBg: 'var(--primary-blue-icon-gradient)',
      comparisonText: '+1.2 from last month',
      percentage: '+12%',
      isPositive: true
    },
    {
      label: 'Cooking',
      value: 7,
      icon: '/icons/cooking.svg',
      iconBg: 'var(--cooking-icon-gradient)',
      comparisonText: '+1.2 from last month',
      percentage: '-12%',
      isPositive: false
    },
    {
      label: 'Ready',
      value: 5,
      icon: '/icons/ready.svg',
      iconBg: 'var(--ready-icon-gradient)',
      comparisonText: '+30 from last month',
      percentage: '+20%',
      isPositive: true
    },
    {
      label: 'Overdue',
      value: 3,
      icon: '/icons/history.svg',
      iconBg: 'var(--overdue-icon-gradient)',
      comparisonText: '+2 from last month',
      percentage: '+12%',
      isPositive: true
    }
  ];
}
