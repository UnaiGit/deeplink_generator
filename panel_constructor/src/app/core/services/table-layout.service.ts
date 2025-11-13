import { Injectable, Signal, computed, signal } from '@angular/core';
import { FloorType } from '../../components/Models/interface-legends';
import { Table } from '../../utils/table.model';
import {
  getFloorTables,
  getKitchenFloorTables,
  getMainFloorTables,
  getMajorFloorTables,
  getTerraceFloorTables,
} from '../../utils/floor-data.util';

type FloorTableMap = Record<string, Table[]>; // Changed to string to support custom floors

@Injectable({
  providedIn: 'root',
})
export class TableLayoutService {
  private readonly tableLayoutsSignal = signal<FloorTableMap>({
    main: getMainFloorTables(),
    terrace: getTerraceFloorTables(),
    kitchen: getKitchenFloorTables(),
    major: getMajorFloorTables(),
  });

  tableLayouts(): Signal<FloorTableMap> {
    return this.tableLayoutsSignal.asReadonly();
  }

  tablesForFloor(floor: FloorType | string): Signal<Table[]> {
    return computed(() => this.cloneTables(this.tableLayoutsSignal()[floor] ?? []));
  }

  getTablesForFloor(floor: FloorType | string): Table[] {
    const storedTables = this.tableLayoutsSignal()[floor];
    if (storedTables && storedTables.length) {
      return this.cloneTables(storedTables);
    }

    if (this.isDefaultFloorType(floor)) {
      const defaults = getFloorTables(floor as FloorType);
      // cache defaults so subsequent calls can use updated positions
      this.tableLayoutsSignal.update(layouts => ({
        ...layouts,
        [floor]: defaults,
      }));
      return this.cloneTables(defaults);
    }

    return this.cloneTables([]);
  }

  // Add a new floor with tables
  addFloor(floorType: FloorType | string, tables: Table[]): void {
    this.tableLayoutsSignal.update(layouts => ({
      ...layouts,
      [floorType]: this.cloneTables(tables),
    }));
  }

  private isDefaultFloorType(floor: string): floor is FloorType {
    return ['main', 'terrace', 'kitchen', 'major'].includes(floor);
  }

  private cloneTables(tables: Table[]): Table[] {
    return tables.map(table => ({
      ...table,
      occupiedChairs: table.occupiedChairs ? [...table.occupiedChairs] : undefined,
      orderSummary: table.orderSummary ? table.orderSummary.map(section => ({ ...section })) : undefined,
      indicators: table.indicators ? { ...table.indicators } : undefined,
    }));
  }
}

