import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Tablelist, TableItem } from './components/tablelist/tablelist';
import { CategoryFilterComponent } from '../../../shared/components/category-filter/category-filter';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card';
import { Orderpannel } from './components/orderpannel/orderpannel';
import { UnsyncedModalComponent } from './components/unsynced-modal/unsynced-modal';
import { 
  ProductDetailModalComponent, 
  ProductDetailData, 
  ProductDetailResult 
} from './components/product-detail-modal/product-detail-modal';
import { store, selectCartState, selectTableCart } from '../../../store/store';
import { 
  addToCart as addToCartAction, 
  plusCart, 
  minusCart, 
  removeCart,
  updateMultipleItemsStatus,
  updateCartItemStatus
} from '../../../store/cart/cartSlice';
import { CartItem } from '../../../store/cart/cartSlice';

export interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  category: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    Tablelist,
    CategoryFilterComponent,
    ProductCardComponent,
    Orderpannel,
    UnsyncedModalComponent,
    ProductDetailModalComponent,
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
})
export class Orders implements OnInit, OnDestroy {
  // Table list data
  tables: TableItem[] = [
    { id: 21, number: 21, clients: 4, status: 'locked', color: 'blue' },
    { id: 3, number: 3, clients: 4, color: 'green' },
    { id: 5, number: 5, clients: 4, color: 'orange' },
    { id: 4, number: 4, clients: 4, status: 'pending', color: 'pink' },
    { id: 6, number: 6, clients: 2, color: 'purple' },
  ];
  activeTable: string | number = 21;
  showPanel = false;
  showUnsyncedModal = false;
  pendingTableSwitch: string | number | null = null;
  
  // Product Detail Modal
  showProductModal = false;
  selectedProductData: ProductDetailData | null = null;

  // Categories
  categories = ['Foods', 'Desserts', 'Drinks'];
  activeCategory = 'All';

  // Products
  allProducts: Product[] = [
    { id: 1, title: 'Spaghetti in Meat Sauce', price: 3.76, image: '/images/food2.png', category: 'Foods' },
    { id: 2, title: 'Grilled Chicken Breast', price: 3.76, image: '/images/food.png', category: 'Foods' },
    { id: 3, title: 'Iced Coffee', price: 3.76, image: '/images/drink2.png', category: 'Drinks' },
    { id: 4, title: 'Ramen Bowl', price: 3.76, image: '/images/food.png', category: 'Foods' },
    { id: 5, title: 'Matcha Latte', price: 3.76, image: '/images/drink1.png', category: 'Drinks' },
    { id: 6, title: 'Hot Chocolate', price: 3.76, image: '/images/drink2.png', category: 'Drinks' },
    { id: 7, title: 'Cappuccino', price: 3.76, image: '/images/drink1.png', category: 'Drinks' },
    { id: 8, title: 'Chocolate Lava Cake', price: 3.76, image: '/images/desert.png', category: 'Desserts' },
    { id: 9, title: 'Tiramisu', price: 3.76, image: '/images/desert.png', category: 'Desserts' },
    { id: 10, title: 'Yogurt Parfait', price: 3.76, image: '/images/desert.png', category: 'Desserts' },
    { id: 11, title: 'Grilled Chicken', price: 3.76, image: '/images/food.png', category: 'Foods' },
    { id: 12, title: 'Spaghetti', price: 3.76, image: '/images/food2.png', category: 'Foods' },
  ];

  get products() {
    if (this.activeCategory === 'All') {
      return this.allProducts;
    }
    return this.allProducts.filter(p => p.category === this.activeCategory);
  }

  cart: CartItem[] = [];
  private unsubscribe?: () => void;

  ngOnInit(): void {
    // Initialize cart for active table
    this.updateCartForTable();
    
    // Subscribe to store changes
    this.unsubscribe = store.subscribe(() => {
      this.updateCartForTable();
    });
  }

  private updateCartForTable(): void {
    // Get cart items for the currently active table
    this.cart = selectTableCart(this.activeTable);
  }

  ngOnDestroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  onTableSelected(tableId: string | number): void {
    // Check if current table has unsynced changes
    if (this.hasUnsyncedChanges() && this.activeTable !== tableId) {
      this.pendingTableSwitch = tableId;
      this.showUnsyncedModal = true;
      return;
    }

    // Switch table directly
    this.switchToTable(tableId);
  }

  hasUnsyncedChanges(): boolean {
    // Unsynced changes = items in cart but order not placed (still in draft state)
    if (this.cart.length === 0) return false;
    
    // Check if any items don't have a status (meaning they haven't been placed yet)
    const hasUnplacedItems = this.cart.some(item => !item.status);
    
    return hasUnplacedItems && this.cart.length > 0;
  }

  switchToTable(tableId: string | number): void {
    this.activeTable = tableId;
    this.showPanel = true; // Show panel when table is selected
    // Update cart for the selected table
    this.updateCartForTable();
  }

  onModalCancel(): void {
    this.showUnsyncedModal = false;
    this.pendingTableSwitch = null;
  }

  onModalSwitch(): void {
    if (this.pendingTableSwitch !== null) {
      this.switchToTable(this.pendingTableSwitch);
    }
    this.showUnsyncedModal = false;
    this.pendingTableSwitch = null;
  }

  get hasOrders(): boolean {
    return this.cart.length > 0;
  }

  get subTotal(): number {
    return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  get tax(): number {
    return +(this.subTotal * 0.10).toFixed(2);
  }

  get discount(): number {
    return 0.28; // Can be calculated based on coupon
  }

  get total(): number {
    return +(this.subTotal - this.discount + this.tax).toFixed(2);
  }

  onCategoryChange(category: string): void {
    this.activeCategory = category;
  }

  getCategoryCount(category: string): number {
    if (category === 'All') {
      return this.allProducts.length;
    }
    return this.allProducts.filter(p => p.category === category).length;
  }

  getAllCategoryCounts(): { [key: string]: number } {
    const counts: { [key: string]: number } = {};
    this.categories.forEach(cat => {
      counts[cat] = this.getCategoryCount(cat);
    });
    return counts;
  }

  getQty(productId: number): number {
    const item = this.cart.find(i => i.id === productId);
    return item ? item.quantity : 0;
  }

  addToCart(product: Product, qty: number): void {
    if (qty <= 0) {
      store.dispatch(removeCart({ id: product.id, tableId: this.activeTable }));
      return;
    }
    // Check if item already exists in cart for this table
    const exists = this.cart.find(i => i.id === product.id);
    if (exists) {
      // If exists, use plusCart to increment
      store.dispatch(plusCart({ id: product.id, tableId: this.activeTable }));
    } else {
      // Map category to order panel categories
      let orderCategory = 'MAIN DISH';
      if (product.category === 'Desserts') {
        orderCategory = 'DESSERTS';
      } else if (product.category === 'Foods') {
        // Could be STARTERS or MAIN DISH, default to MAIN DISH
        orderCategory = 'MAIN DISH';
      }
      
      // If new, add to cart with table ID and category
      store.dispatch(addToCartAction({ 
        id: product.id, 
        name: product.title, 
        image: product.image, 
        price: product.price,
        tableId: this.activeTable,
        category: orderCategory
      }));
    }
  }

  decProduct(product: Product): void {
    store.dispatch(minusCart({ id: product.id, tableId: this.activeTable }));
  }

  incItem(item: CartItem): void {
    store.dispatch(plusCart({ id: item.id, tableId: this.activeTable }));
  }

  decItem(item: CartItem): void {
    store.dispatch(minusCart({ id: item.id, tableId: this.activeTable }));
  }

  removeItem(item: CartItem): void {
    store.dispatch(removeCart({ id: item.id, tableId: this.activeTable }));
  }

  getActiveTableClients(): number {
    const table = this.tables.find(t => t.id === this.activeTable);
    return table?.clients || 0;
  }

  getActiveTableStatus(): 'open' | 'reserved' | 'in-service' | 'sent-to-kitchen' {
    const table = this.tables.find(t => t.id === this.activeTable);
    const status = table?.status as string | undefined;
    if (status === 'locked' || status === 'reserved') {
      return 'reserved';
    }
    if (status === 'in-service') {
      return 'in-service';
    }
    if (this.hasOrders) {
      return 'sent-to-kitchen';
    }
    return 'open';
  }

  isTableLocked(): boolean {
    const table = this.tables.find(t => t.id === this.activeTable);
    const status = table?.status as string | undefined;
    return status === 'locked' || status === 'reserved';
  }

  onUnlockTable(): void {
    const table = this.tables.find(t => t.id === this.activeTable);
    if (table) {
      // Update table status to open
      table.status = undefined;
    }
  }

  onPlaceOrder(): void {
    console.log('Order placed for table', this.activeTable);
    // Update table status to pending (In Service)
    const table = this.tables.find(t => t.id === this.activeTable);
    if (table) {
      table.status = 'pending';
    }
    
    // Set all cart items to 'locked' status initially (first image shows locked state)
    const allItemIds = this.cart.map(item => item.id);
    if (allItemIds.length > 0) {
      store.dispatch(updateMultipleItemsStatus({
        itemIds: allItemIds,
        status: 'locked',
        tableId: this.activeTable
      }));
      this.updateCartForTable();
    }
  }

  onUpdateOrder(): void {
    console.log('Updating order for table', this.activeTable);
    
    // Toggle between locked and open status
    const hasLockedItems = this.cart.some(item => item.status === 'locked');
    
    if (hasLockedItems) {
      // Unlock items for editing
      const allItemIds = this.cart.map(item => item.id);
      if (allItemIds.length > 0) {
        store.dispatch(updateMultipleItemsStatus({
          itemIds: allItemIds,
          status: 'open',
          tableId: this.activeTable
        }));
        this.updateCartForTable();
      }
    }
  }

  onUnlockOrder(): void {
    console.log('Unlocking order for table', this.activeTable);
    
    // Set all cart items to 'open' status when unlocked
    const allItemIds = this.cart.map(item => item.id);
    if (allItemIds.length > 0) {
      store.dispatch(updateMultipleItemsStatus({
        itemIds: allItemIds,
        status: 'open',
        tableId: this.activeTable
      }));
      this.updateCartForTable();
    }
  }

  onSendToKitchen(selectedIds: number[]): void {
    console.log('Sending to kitchen:', selectedIds);
    
    // Update cart items status to locked for selected items
    store.dispatch(updateMultipleItemsStatus({
      itemIds: selectedIds,
      status: 'locked',
      tableId: this.activeTable
    }));

    // Update table status to active (Sent to kitchen)
    const table = this.tables.find(t => t.id === this.activeTable);
    if (table) {
      table.status = 'active';
    }
    
    // Update local cart reference
    this.updateCartForTable();
  }

  onMarkAllDelivered(): void {
    console.log('Marking all as delivered for table', this.activeTable);
    
    // Get all item IDs
    const allItemIds = this.cart.map(item => item.id);
    
    // Update all cart items status to delivered
    store.dispatch(updateMultipleItemsStatus({
      itemIds: allItemIds,
      status: 'delivered',
      tableId: this.activeTable
    }));
    
    // Update table status to active (sent to kitchen)
    const table = this.tables.find(t => t.id === this.activeTable);
    if (table) {
      table.status = 'active';
    }
    
    // Update local cart reference
    this.updateCartForTable();
  }

  onRemoveFromOrder(): void {
    // When items are removed, check if cart is empty and reset state
    this.updateCartForTable();
  }

  // Product Detail Modal Methods
  onProductZoom(product: Product): void {
    this.openProductModal(product);
  }

  openProductModal(product: Product): void {
    this.selectedProductData = {
      id: product.id.toString(),
      name: product.title,
      image: product.image,
      category: product.category,
      basePrice: product.price,
      variants: [
        { id: 'regular', name: 'Regular', price: 0, isIncluded: true },
        { id: 'large', name: 'Large', price: 0.50, isIncluded: false }
      ],
      sauces: [
        { id: 'tomato', name: 'Tomato', price: 0, isIncluded: true },
        { id: 'arrabiata', name: 'Arrabiata (spicy)', price: 0.50, isIncluded: false }
      ],
      toppings: [
        { id: 'cheese', name: 'Extra Cheese', price: 0, isIncluded: true },
        { id: 'mushroom', name: 'Mushroom', price: 0.50, isIncluded: false },
        { id: 'olives', name: 'Olives', price: 0.50, isIncluded: false }
      ],
      maxToppings: 3
    };
    this.showProductModal = true;
  }

  onProductModalClose(): void {
    this.showProductModal = false;
    this.selectedProductData = null;
  }

  onProductModalAddToCart(result: ProductDetailResult): void {
    // Add product to cart with the selected options
    store.dispatch(addToCartAction({ 
      id: parseInt(result.productId), 
      name: this.selectedProductData?.name || '', 
      image: this.selectedProductData?.image || '', 
      price: result.totalPrice / result.quantity, 
      quantity: result.quantity,
      tableId: this.activeTable 
    }));
    
    // Update the local cart reference
    this.updateCartForTable();
  }
}
