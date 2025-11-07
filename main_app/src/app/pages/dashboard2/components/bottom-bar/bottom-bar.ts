import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-bottom-bar',
  standalone: true,
  templateUrl: './bottom-bar.html',
  styleUrls: ['./bottom-bar.scss'],
})
export class BottomBarComponent {
  @Output() dish = new EventEmitter<void>();
  @Output() share = new EventEmitter<void>();
}


