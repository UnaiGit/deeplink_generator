export interface Allergen {
  id: string;
  name: string;
  icon: string;
  color: string;
  selected: boolean;
}

export interface Ingredient {
  id?: string;
  name: string;
  quantity: number | string;
  uom: string;
}

export interface ExtraToggle {
  name: string;
  selected: boolean;
}

export interface ExtraGroup {
  name: string;
  extras: ExtraToggle[];
  color?: string;
  textColor?: string;
}

export interface SubcategoryItem {
  name: string;
  checked: boolean;
}

export interface Subcategory {
  id: string;
  name: string;
  format: string;
  min: number;
  max: number;
  position: string;
  items: SubcategoryItem[];
  expanded?: boolean;
}

export interface DepartureSection {
  id: number;
  order: string;
  items: string[];
}

export interface DishItem {
  dish: string;
  extraCost: string;
}


