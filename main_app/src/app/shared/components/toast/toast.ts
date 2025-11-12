import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class Toast implements OnInit {
  @Input() message: string = '';
  @Input() type: 'success' | 'error' | 'info' = 'success';
  @Input() show: boolean = false;
  @Input() duration: number = 3000; // Auto-hide after 3 seconds

  ngOnInit(): void {
    if (this.show && this.duration > 0) {
      setTimeout(() => {
        this.show = false;
      }, this.duration);
    }
  }
}

