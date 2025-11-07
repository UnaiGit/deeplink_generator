import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon-button',
  imports: [CommonModule],
  templateUrl: './icon-button.html',
  styleUrl: './icon-button.scss',
})
export class IconButton {
  icon = input<string>('');
  label = input<string>('');
  size = input<'small' | 'medium' | 'large'>('medium');
  variant = input<'default' | 'primary' | 'secondary' | 'accent'>('default');
  disabled = input<boolean>(false);
  
  clicked = output<void>();

  onClick(): void {
    if (!this.disabled()) {
      this.clicked.emit();
    }
  }
}

