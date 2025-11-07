import { Component, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FloorType } from '../Models/interface-legends';
@Component({
  selector: 'app-floor-tabs',
  imports: [TranslateModule],
  templateUrl: './floor-tabs.html',
  styleUrl: './floor-tabs.scss',
})

export class FloorTabs {

  selectedFloor = input<FloorType>('main');
  floorChange = output<FloorType>();

  floors: { id: FloorType; translationKey: string }[] = [
    { id: 'major', translationKey: 'floors.major' },
    { id: 'terrace', translationKey: 'floors.terrace' },
    { id: 'main', translationKey: 'floors.main' },
    { id: 'kitchen', translationKey: 'floors.kitchen' }
  ];

  selectFloor(floor: FloorType): void {
    this.floorChange.emit(floor);
  }


}
