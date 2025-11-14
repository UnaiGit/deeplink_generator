/**
 * Kitchen-related interfaces
 */

export interface KitchenItem {
  id: string;
  label: string;
  image: string;
  description?: string;
  category?: string;
  // Department/Station metadata
  departmentName?: string; // e.g., "Hot Kitchen", "Sushi Station"
  emoji?: string; // e.g., "🍳", "🍣"
  preparationTime?: number; // Average preparation time in minutes
  currentLoad?: number; // Current load percentage (0-100)
  notes?: string; // Additional notes about the station
  assignedEmployees?: string[]; // Array of employee IDs assigned to this station
}

export interface KitchenLayoutItem extends KitchenItem {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface KitchenCatalog {
  items: KitchenItem[];
  startIndex: number;
  displayCount: number;
}

