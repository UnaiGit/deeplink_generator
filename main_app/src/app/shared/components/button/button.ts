import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {
  // Variants: primary, secondary, danger, success, outline, ghost
  variant = input<'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost'>('primary');
  
  // Sizes: small, medium, large
  size = input<'small' | 'medium' | 'large'>('medium');
  
  // Button type
  type = input<'button' | 'submit' | 'reset'>('button');
  
  // States
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  
  // Icon support
  icon = input<string>('');
  iconPosition = input<'left' | 'right'>('left');
  
  // Full width
  fullWidth = input<boolean>(false);
  
  // Custom width (for flexible sizing)
  width = input<string>('');
  
  // Events
  clicked = output<MouseEvent>();
  
  // Custom class input
  customClass = input<string>('');
  
  buttonClasses = computed(() => ({
    [`btn-${this.variant()}`]: true,
    [`btn-${this.size()}`]: true,
    'btn-full-width': this.fullWidth(),
    'btn-loading': this.loading(),
    'btn-disabled': this.disabled(),
    [this.customClass()]: !!this.customClass(),
  }));
  
  buttonStyles = computed(() => {
    const styles: Record<string, string> = {};
    if (this.width()) {
      styles['width'] = this.width();
    }
    return styles;
  });
  
  onClick(event: MouseEvent): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit(event);
    }
  }
}

