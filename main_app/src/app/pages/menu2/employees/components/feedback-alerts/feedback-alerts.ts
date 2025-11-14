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
  alerts: AlertItem[] = [
    { 
      message: 'Employee John Doe completed training successfully',
      color: 'green'
    },
    { 
      message: 'Shift schedule updated for next week',
      color: 'pink'
    },
    { 
      message: 'Performance review reminder for Sarah Smith',
      color: 'yellow'
    },
    { 
      message: 'New employee onboarding completed',
      color: 'green'
    },
  ];

  onAddAlert(): void {
    console.log('Add alert clicked');
  }
}


