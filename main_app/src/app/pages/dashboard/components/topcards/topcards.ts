import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Card } from '@/types/interfaces/dashboard/card.interface';

@Component({
  selector: 'app-topcards',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './topcards.html',
  styleUrls: ['./topcards.scss'],
})
export class Topcards{
  cards: Card[] = [
    {
      titleKey: 'Assessment',
      value: '4.3',
      unitKey: '',
      iconSrc: '/icons/teacup.svg',
      iconBg: 'linear-gradient(180deg, #81AAFA 0%, #2D71F7 100%)',
      leftNotePrefix: '+1.2',
      leftNoteSuffixKey: 'from last month',
      rightDelta: '+12%',
      rightTone: 'positive',
    },
    {
      titleKey: 'Earnings',
      value: '1200',
      unitKey: '/day',
      iconSrc: '/icons/dollar.png',
      iconBg: 'linear-gradient(180deg, #9EE1D4 0%, #40C4AA 100%)',
      leftNotePrefix: '+30',
      leftNoteSuffixKey: 'from last month',
      rightDelta: '+20%',
      rightTone: 'positive',
    },
    {
      titleKey: 'Order',
      value: '17',
      unitKey: '/minutes',
      iconSrc: '/icons/ordericon.png',
      iconBg: 'linear-gradient(180deg, #FCDA83 0%, #FFBE4C 100%)',
      leftNotePrefix: '+1.2',
      leftNoteSuffixKey: 'from last month',
      rightDelta: '-12%',
      rightTone: 'negative',
    },
    {
      titleKey: 'Connection',
      value: '12',
      unitKey: '',
      iconSrc: '/icons/conecticon.png',
      iconBg: 'linear-gradient(180deg, #7EDDF1 0%, #33CFFF 100%)',
      leftNotePrefix: '+2',
      leftNoteSuffixKey: 'from last month',
      rightDelta: '+12%',
      rightTone: 'positive',
    },
  ];
}
