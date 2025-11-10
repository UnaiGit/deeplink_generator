export interface OrderItem {
  id: string;
  dishName: string;
  table: string;
  priority: number;
  estimatedTime: string;
  note: string;
}

export interface KitchenColumn {
  id: string;
  label: string;
  count: number;
  icon: string;
  items: OrderItem[];
}


