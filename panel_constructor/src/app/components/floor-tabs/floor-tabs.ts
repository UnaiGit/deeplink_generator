import { Component, input, output, inject, Signal, computed } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FloorType } from '../Models/interface-legends';
import { FloorService } from '../../core/services/floor.service';

@Component({
  selector: 'app-floor-tabs',
  imports: [TranslateModule],
  templateUrl: './floor-tabs.html',
  styleUrl: './floor-tabs.scss',
})

export class FloorTabs {
  private readonly floorService = inject(FloorService);

  selectedFloor = input<FloorType | string>('main');
  floorChange = output<FloorType | string>();

  // Get floors dynamically from service with display names
  floors: Signal<Array<{ id: string; floorType: string; translationKey: string; name: string }>> = computed(() => {
    const floorTypes = this.floorService.getAllFloorTypes();
    const allFloors = this.floorService.getFloors();
    
    return floorTypes.map(ft => {
      const floor = allFloors().find(f => f.id === ft.id);
      return {
        ...ft,
        name: floor?.name || ft.translationKey,
      };
    });
  });

  selectFloor(floor: FloorType | string): void {
    this.floorChange.emit(floor);
  }

  getFloorDisplayName(floor: { translationKey: string; name: string }): string {
    // For default floors, use translation; for custom floors, use name
    if (floor.translationKey && floor.translationKey.startsWith('floors.') && !floor.translationKey.includes('-')) {
      // This will be translated
      return floor.translationKey;
    }
    return floor.name;
  }

  isTranslatable(translationKey: string): boolean {
    return Boolean(translationKey && translationKey.startsWith('floors.') && !translationKey.includes('-'));
  }
}
