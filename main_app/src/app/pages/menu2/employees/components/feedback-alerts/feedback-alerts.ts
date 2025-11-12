import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

interface AlertItem {
  message: string;
  color: 'green' | 'pink' | 'yellow';
}

@Component({
  selector: 'app-feedback-alerts',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './feedback-alerts.html',
  styleUrl: './feedback-alerts.scss',
})
export class FeedbackAlerts {
  // alerts: AlertItem[] = [];
  // Uncomment below to see data:
  alerts: AlertItem[] = [
    { 
      message: 'Removed from Sushi By Jove, my quick study of lexicography won a prize!',
      color: 'green'
    },
    { 
      message: 'Removed from Sushi By Jove, my quick study of lexicography won a prize!',
      color: 'pink'
    },
    { 
      message: 'Removed from Sushi By Jove, my quick study of lexicography won a prize!',
      color: 'yellow'
    },
    { 
      message: 'Removed from Sushi By Jove, my quick study of lexicography won a prize!',
      color: 'green'
    },
  ];

  onAddAlert(): void {
    console.log('Add alert clicked');
  }
}


