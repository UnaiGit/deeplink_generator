import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { OrderItemComponent } from '../order-item/order-item';
import { PaymentModalComponent, PaymentData, PaymentResult } from '../payment-modal/payment-modal';
import { SpecialChargeModalComponent, SpecialChargeData, SpecialChargeResult } from '../special-charge-modal/special-charge-modal';
import { CartItem, savePayment, clearPayment } from '../../../../../store/cart/cartSlice';
import { store } from '../../../../../store/store';

export interface Client {
  id: string;
  name: string;
  avatar?: string;
}

@Component({
  selector: 'app-orderpannel',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, OrderItemComponent, PaymentModalComponent, SpecialChargeModalComponent],
  templateUrl: './orderpannel.html',
  styleUrl: './orderpannel.scss',
})
export class Orderpannel implements OnInit, OnChanges {
  @Input() tableNumber: string | number = 21;
  @Input() hasOrders = false;
  @Input() subTotal = 0;
  @Input() discount = 0;
  @Input() tax = 0;
  @Input() total = 0;
  @Input() cartItems: CartItem[] = [];
  @Input() clients: Client[] = [];
  @Input() clientsCount: number = 4;
  @Input() tableStatus: 'open' | 'reserved' | 'in-service' | 'sent-to-kitchen' = 'open';
  @Input() isLocked = false;

  @Output() increment = new EventEmitter<CartItem>();
  @Output() decrement = new EventEmitter<CartItem>();
  @Output() remove = new EventEmitter<CartItem>();
  @Output() unlock = new EventEmitter<void>();
  @Output() clientSelected = new EventEmitter<string>();
  @Output() selectAll = new EventEmitter<boolean>();
  @Output() itemSelected = new EventEmitter<{ item: CartItem; selected: boolean }>();
  @Output() placeOrderEvent = new EventEmitter<void>();
  @Output() updateOrderEvent = new EventEmitter<void>();
  @Output() sendToKitchen = new EventEmitter<number[]>();
  @Output() markAllDelivered = new EventEmitter<void>();

  couponCode = '';
  selectedClient: string = 'all';
  selectedClients: Set<string> = new Set(['all']); // Multiple client selection
  selectAllItems = false;
  selectedItems: Set<number | string> = new Set();
  orderState: 'draft' | 'placed' | 'sent-to-kitchen' | 'in-service' = 'draft';
  isOrderLocked = false; // Track if items are locked or unlocked

  // Modals
  showPaymentModal = false;
  showSpecialChargeModal = false;
  paymentModalData: PaymentData | null = null;
  specialChargeModalData: SpecialChargeData | null = null;

  ngOnInit(): void {
    // Initialize clients if not provided
    if (this.clients.length === 0) {
      this.clients = [
        { 
          id: 'kim', 
          name: 'Kim',
          avatar: '/images/avatar.png'
        },
        { 
          id: 'alex', 
          name: 'Alex',
          avatar: '/images/avatar1.png'
        },
        { 
          id: 'naomi', 
          name: 'Naomi',
          avatar: '/images/avatar2.png'
        },
        { 
          id: 'john', 
          name: 'John',
          avatar: '/images/avatar3.png'
        },
      ];
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Reset order state when cart becomes empty
    if (changes['cartItems'] || changes['hasOrders']) {
      if (!this.hasOrders || this.cartItems.length === 0) {
        this.orderState = 'draft';
        this.isOrderLocked = false;
        this.selectedItems.clear();
        this.selectAllItems = false;
      }
    }
  }

  applyCoupon(): void {
    // Handle coupon application
    console.log('Applying coupon:', this.couponCode);
  }

  placeOrder(): void {
    // Check if button shows "Proceed to payment" - then open payment modal
    const buttonText = this.getButtonText();
    if (buttonText === 'Proceed to payment') {
      this.openPaymentModal();
      return;
    }

    // Handle other button states
    if (this.orderState === 'draft' && this.total > 0) {
      // Place order - lock items immediately (show "Locked" badge)
      // If items are selected, only place those items
      // If no items selected, place all items
      this.orderState = 'in-service';
      this.isOrderLocked = true;
      this.placeOrderEvent.emit();
    } else if (this.orderState === 'in-service' && this.isOrderLocked) {
      // Update order - unlock items to allow editing
      this.isOrderLocked = false;
      this.updateOrderEvent.emit();
      console.log('Order unlocked for editing');
    } else if (this.orderState === 'in-service' && !this.isOrderLocked && !this.allItemsDelivered()) {
      // Lock items again after editing (save changes)
      this.isOrderLocked = true;
      this.placeOrderEvent.emit();
      console.log('Order locked after update');
    }
  }

  openPaymentModal(): void {
    this.paymentModalData = {
      tableNumber: this.tableNumber,
      subTotal: this.subTotal,
      discount: this.discount,
      tax: this.tax,
      total: this.total,
      clientsCount: this.clientsCount
    };
    this.showPaymentModal = true;
  }

  onPaymentModalClose(): void {
    this.showPaymentModal = false;
  }

  onPaymentConfirm(result: PaymentResult): void {
    console.log('Payment confirmed:', result);
    
    // Save payment info to Redux
    store.dispatch(savePayment({
      tableId: this.tableNumber,
      paymentInfo: {
        splitType: result.splitType,
        numberOfPeople: result.numberOfPeople,
        tipPercentage: result.tipPercentage,
        customTip: result.customTip,
        paymentMethod: result.paymentMethod,
        finalTotal: result.finalTotal,
        specialChargeData: result.specialChargeData,
        timestamp: Date.now()
      }
    }));
    
    // Close modal
    this.showPaymentModal = false;
    
    // Emit event to parent for further processing (e.g., close table, print receipt)
    console.log('Payment saved to Redux for table:', this.tableNumber);
  }

  onOpenSpecialCharge(): void {
    // Prepare special charge data
    this.specialChargeModalData = {
      tableNumber: this.tableNumber,
      clients: this.clients,
      orderItems: this.cartItems.map(item => ({
        name: item.name || '',
        quantity: item.quantity,
        price: item.price
      })),
      subTotal: this.subTotal,
      discount: this.discount,
      tax: this.tax,
      total: this.total
    };
    this.showSpecialChargeModal = true;
  }

  onSpecialChargeModalClose(): void {
    this.showSpecialChargeModal = false;
  }

  onSpecialChargeConfirm(result: SpecialChargeResult): void {
    console.log('Special charge confirmed:', result);
    
    // If special charge is confirmed, save it with payment
    store.dispatch(savePayment({
      tableId: this.tableNumber,
      paymentInfo: {
        splitType: result.splitType,
        numberOfPeople: result.selectedPayers.length,
        tipPercentage: 0,
        paymentMethod: result.mode === 'company' ? 'charge-to-room' : 'card',
        finalTotal: this.total,
        specialChargeData: result,
        timestamp: Date.now()
      }
    }));
    
    // Close both modals
    this.showSpecialChargeModal = false;
    this.showPaymentModal = false;
    
    // Emit event to parent for further processing
    console.log('Special charge saved to Redux for table:', this.tableNumber);
  }

  onMarkAllDelivered(): void {
    // Mark all delivered - unlock items and change to delivered state
    this.isOrderLocked = false;
    this.orderState = 'sent-to-kitchen'; // Change state to show "Proceed to payment"
    this.markAllDelivered.emit();
  }

  allItemsDelivered(): boolean {
    // Check if all items have been marked as delivered
    return this.cartItems.length > 0 && this.cartItems.every(item => item.status === 'delivered');
  }

  onUnlockOrder(): void {
    // Unlock items - show checkboxes and change to open state
    this.isOrderLocked = false;
    this.unlock.emit();
  }

  canSendToKitchen(): boolean {
    return this.orderState === 'placed' && this.selectedItems.size > 0;
  }

  showCheckboxes(): boolean {
    // Show checkboxes in draft state for selecting items to place
    // Or show when items are unlocked in in-service state
    return this.orderState === 'draft' || (this.orderState === 'in-service' && !this.isOrderLocked);
  }

  showMarkDelivered(): boolean {
    // Show mark all delivered button when items are locked
    return this.orderState === 'in-service' && this.isOrderLocked;
  }

  showLockedBadge(): boolean {
    // Show "Locked" badge when items are locked and order is placed (not delivered)
    return this.orderState === 'in-service' && this.isOrderLocked && !this.allItemsDelivered();
  }

  showOpenBadge(): boolean {
    // Show "Open" badge when items are unlocked or all delivered
    return this.orderState === 'in-service' && (!this.isOrderLocked || this.allItemsDelivered()) ||
           this.orderState === 'sent-to-kitchen';
  }
  
  showCategoryBadges(): boolean {
    // Only show category badges when order is placed (not in draft)
    return this.orderState !== 'draft';
  }

  onIncrement(item: CartItem): void {
    this.increment.emit(item);
  }

  onDecrement(item: CartItem): void {
    this.decrement.emit(item);
  }

  onRemove(item: CartItem): void {
    this.remove.emit(item);
    
    // Check if this was the last item and reset state
    setTimeout(() => {
      if (this.cartItems.length === 0 || !this.hasOrders) {
        this.orderState = 'draft';
        this.isOrderLocked = false;
        this.selectedItems.clear();
        this.selectAllItems = false;
      }
    }, 100);
  }

  onUnlock(): void {
    this.unlock.emit();
  }

  onClientSelect(clientId: string): void {
    // Handle "all" selection
    if (clientId === 'all') {
      if (this.selectedClients.has('all')) {
        // If "all" is already selected, deselect it and select all clients
        this.selectedClients.clear();
        this.clients.forEach(client => this.selectedClients.add(client.id));
      } else {
        // Select "all" and deselect individual clients
        this.selectedClients.clear();
        this.selectedClients.add('all');
      }
    } else {
      // Handle individual client selection
      if (this.selectedClients.has(clientId)) {
        this.selectedClients.delete(clientId);
      } else {
        this.selectedClients.delete('all'); // Remove "all" when selecting individual client
        this.selectedClients.add(clientId);
      }
      
      // If no clients selected, select "all" by default
      if (this.selectedClients.size === 0) {
        this.selectedClients.add('all');
      }
    }
    
    // Update selectedClient for backward compatibility
    this.selectedClient = this.selectedClients.has('all') ? 'all' : Array.from(this.selectedClients)[0];
    this.clientSelected.emit(Array.from(this.selectedClients).join(','));
  }

  isClientSelected(clientId: string): boolean {
    return this.selectedClients.has(clientId);
  }

  onSelectAllChange(checked: boolean): void {
    this.selectAllItems = checked;
    if (checked) {
      this.cartItems.forEach(item => this.selectedItems.add(item.id));
    } else {
      this.selectedItems.clear();
    }
    this.selectAll.emit(checked);
  }

  onItemSelectChange(item: CartItem, checked: boolean): void {
    if (checked) {
      this.selectedItems.add(item.id);
    } else {
      this.selectedItems.delete(item.id);
      this.selectAllItems = false;
    }
    this.itemSelected.emit({ item, selected: checked });
  }

  isItemSelected(itemId: number | string): boolean {
    return this.selectedItems.has(itemId);
  }

  // Group items by category
  getItemsByCategory(category: string): CartItem[] {
    return this.cartItems.filter(item => {
      const itemCategory = item.category || 'MAIN DISH';
      return itemCategory.toUpperCase() === category.toUpperCase();
    });
  }

  getCategories(): string[] {
    const categories = new Set<string>();
    this.cartItems.forEach(item => {
      const cat = item.category || 'MAIN DISH';
      categories.add(cat.toUpperCase());
    });
    // Return in a specific order
    const orderedCategories = ['STARTERS', 'MAIN DISH', 'DESSERTS'];
    return orderedCategories.filter(cat => categories.has(cat));
  }

  getStatusText(): string {
    switch (this.tableStatus) {
      case 'in-service':
        return 'In Service';
      case 'sent-to-kitchen':
        return 'Sent to kitchen';
      case 'reserved':
        return 'Reserved';
      default:
        return '';
    }
  }

  getButtonText(): string {
    // If no orders, always show "Place order"
    if (!this.hasOrders || this.cartItems.length === 0) {
      return 'Place order';
    }
    
    // If all items delivered, show "Proceed to payment"
    if (this.orderState === 'sent-to-kitchen' || this.allItemsDelivered()) {
      return 'Proceed to payment';
    }
    
    // In in-service state, always show "Update order"
    if (this.orderState === 'in-service') {
      return 'Update order';
    }
    
    return 'Place order';
  }

  getItemStatus(item: CartItem): 'open' | 'locked' | 'delivered' | 'billing-only' | undefined {
    // In draft state, don't show any status
    if (this.orderState === 'draft') {
      return undefined;
    }
    
    // Return item status based on order lock state
    if (this.isOrderLocked) {
      return item.status === 'delivered' ? 'delivered' : 'locked';
    }
    return item.status;
  }

  getClientNameForItem(item: CartItem): string | undefined {
    if (item.clientId && this.clients.length > 0) {
      const client = this.clients.find(c => c.id === item.clientId);
      return client?.name;
    }
    return undefined;
  }
}
