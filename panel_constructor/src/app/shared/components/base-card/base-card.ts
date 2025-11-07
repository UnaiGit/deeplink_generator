import { Component, input, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-base-card',
  imports: [CommonModule],
  templateUrl: './base-card.html',
  styleUrl: './base-card.scss',
})
export class BaseCard {
  variant = input<'default' | 'elevated' | 'outlined'>('default');
  padding = input<'none' | 'small' | 'medium' | 'large'>('medium');
  clickable = input<boolean>(false);
}

