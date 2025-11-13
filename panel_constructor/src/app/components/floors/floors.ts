import { Component, Signal, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Floor } from '../../core/models/floor.model';
import { FloorService } from '../../core/services/floor.service';
import { ToastService } from '../../core/services/toast.service';
import { ICON_PATHS } from '../../core/constants/icon.constants';
import { AddFloorModal, AddFloorFormData } from '../add-floor-modal/add-floor-modal';

export interface FloorPanelAnchor {
  x: number;
  y: number;
  width: number;
  height: number;
}

@Component({
  selector: 'app-floors',
  imports: [CommonModule, TranslateModule, AddFloorModal],
  templateUrl: './floors.html',
  styleUrl: './floors.scss',
})
export class Floors {
  isOpen = input<boolean>(false);
  close = output<void>();
  floorSelect = output<string>(); // Emit floor id when a floor is selected
  anchor = input<FloorPanelAnchor | null>(null);

  private readonly floorService = inject(FloorService);
  private readonly toastService = inject(ToastService);
  floors: Signal<Floor[]> = this.floorService.getFloors();
  floorsIcon = ICON_PATHS.floors;
  
  showAddFloorModal = signal<boolean>(false);

  onOverlayClick(): void {
    this.close.emit();
  }

  onModalClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  onFloorClick(floor: Floor): void {
    console.log('Floor clicked:', floor.name);
    // Get the floorType from the service
    const floorDef = this.floorService.getAllFloorTypes().find(f => f.id === floor.id);
    if (floorDef) {
      this.floorSelect.emit(floorDef.floorType);
    }
    this.close.emit();
  }

  onAddFloor(): void {
    console.log('Add floor clicked');
    this.showAddFloorModal.set(true);
  }

  onCloseAddFloorModal(): void {
    this.showAddFloorModal.set(false);
  }

  onSaveFloor(formData: AddFloorFormData): void {
    console.log('Saving new floor:', formData);
    // Add floor to service - this will update floors list and table layout
    this.floorService.addFloor(formData);
    
    // Show success toast
    this.toastService.success('Floor created.');
    
    this.showAddFloorModal.set(false);
    
    // Optionally close the floors panel after adding
    // this.close.emit();
  }
}

