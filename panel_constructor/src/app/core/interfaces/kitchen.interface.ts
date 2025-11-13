/**
 * Kitchen-related interfaces
 */

export interface KitchenItem {
  id: string;
  label: string;
  image: string;
  description?: string;
  category?: string;
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

