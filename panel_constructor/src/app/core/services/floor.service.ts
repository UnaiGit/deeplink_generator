import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { Floor } from '../models/floor.model';
import { ICON_PATHS } from '../constants/icon.constants';
import { TableLayoutService } from './table-layout.service';
import { FloorType } from '../../components/Models/interface-legends';
import { AddFloorFormData } from '../../components/add-floor-modal/add-floor-modal';

export interface CustomFloor {
  id: string;
  floorType: string; // Can be FloorType or custom string
  translationKey: string;
  name: string;
  timeLimit?: number;
  pricingPolicy?: string;
  currency?: string;
  amount?: number;
}

@Injectable({
  providedIn: 'root',
})
export class FloorService {
  private readonly tableLayoutService = inject(TableLayoutService);

  // Default floors with their corresponding FloorType
  private readonly defaultFloorDefinitions: Array<{ id: string; floorType: FloorType; translationKey: string }> = [
    { id: 'main', floorType: 'main', translationKey: 'floors.main' },
    { id: 'terrace', floorType: 'terrace', translationKey: 'floors.terrace' },
    { id: 'major', floorType: 'major', translationKey: 'floors.major' },
    { id: 'kitchen', floorType: 'kitchen', translationKey: 'floors.kitchen' },
  ];

  // Custom floors added by user
  private readonly customFloorsSignal = signal<CustomFloor[]>([]);

  // Get all floor definitions (default + custom)
  private getAllFloorDefinitions(): Array<{ id: string; floorType: string; translationKey: string }> {
    const customFloors = this.customFloorsSignal().map(cf => ({
      id: cf.id,
      floorType: cf.floorType,
      translationKey: cf.translationKey,
    }));
    
    return [...this.defaultFloorDefinitions, ...customFloors];
  }

  // Compute floors with actual data from tables
  floors: Signal<Floor[]> = computed(() => {
    const tableLayouts = this.tableLayoutService.tableLayouts();
    const allFloorDefs = this.getAllFloorDefinitions();
    
    return allFloorDefs.map(floorDef => {
      // Get tables for this floor (works for both default and custom floors)
      const tables = tableLayouts()[floorDef.floorType] || [];
      const totalTables = tables.length;
      const reservationCount = tables.filter(table => table.status === 'booked').length;
      
      // For custom floors, get the actual name from customFloorsSignal
      const customFloor = this.customFloorsSignal().find(cf => cf.id === floorDef.id);
      const displayName = customFloor?.name || floorDef.translationKey;
      
      return {
        id: floorDef.id,
        name: displayName,
        translationKey: floorDef.translationKey,
        reservationCount: reservationCount > 0 ? reservationCount : undefined,
        tableCount: totalTables,
        icon: ICON_PATHS.floors,
      };
    });
  });

  getFloors(): Signal<Floor[]> {
    return this.floors;
  }

  getFloorById(id: string): Floor | undefined {
    return this.floors().find(floor => floor.id === id);
  }

  // Add a new custom floor
  addFloor(formData: AddFloorFormData): void {
    const floorId = formData.name.toLowerCase().replace(/\s+/g, '-');
    const translationKey = `floors.${floorId}`;
    
    const customFloor: CustomFloor = {
      id: floorId,
      floorType: floorId, // Use the id as floorType for custom floors
      translationKey: translationKey,
      name: formData.name,
      timeLimit: formData.timeLimit ? parseInt(formData.timeLimit, 10) : undefined,
      pricingPolicy: formData.pricingPolicy,
      currency: formData.currency,
      amount: formData.pricingPolicy === 'baseFee' 
        ? parseFloat(formData.baseFeeAmount) 
        : formData.pricingPolicy === 'minimumSpend'
        ? parseFloat(formData.minimumSpendAmount)
        : formData.pricingPolicy === 'percentageSurcharge'
        ? parseFloat(formData.percentageSurcharge)
        : undefined,
    };

    // Add to custom floors
    this.customFloorsSignal.update(floors => [...floors, customFloor]);

    // Add to table layout service with empty tables array
    this.tableLayoutService.addFloor(floorId as FloorType, []);

    // Add translation key (you might want to store this in a service or localStorage)
    // For now, we'll use the name directly
    console.log('New floor added:', customFloor);
  }

  // Get all floor types (for floor tabs)
  getAllFloorTypes(): Array<{ id: string; floorType: string; translationKey: string }> {
    return this.getAllFloorDefinitions();
  }
}

