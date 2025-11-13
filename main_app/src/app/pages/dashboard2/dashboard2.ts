import { Component, OnDestroy, OnInit } from '@angular/core';
import { store, selectCartState } from '../../store/store';
import { addToCart as addToCartAction, plusCart, minusCart, removeCart } from '../../store/cart/cartSlice';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ProductCardComponent } from '../../shared/components/product-card/product-card';
import { CategoryFilterComponent } from '../../shared/components/category-filter/category-filter';
import { OrderItemComponent } from './components/order-item/order-item';
import { SummaryPanelComponent } from './components/summary-panel/summary-panel';
import { Product } from '@/types/interfaces/dashboard2/product.interface';
import { CartItem } from '@/types/interfaces/dashboard2/cart-item.interface';
import { CategoryCounts } from '@/types/dashboard2/category-counts.type';

@Component({
  selector: 'app-dashboard2',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ProductCardComponent,
    CategoryFilterComponent,
    OrderItemComponent,
    SummaryPanelComponent,
  ],
  templateUrl: './dashboard2.html',
  styleUrls: ['./dashboard2.scss'],
})
export class Dashboard2 implements OnInit, OnDestroy {
  categories = ['Foods', 'Desserts', 'Drinks'];
  activeCategory = 'All';

  allProducts: Product[] = [
    // Foods - 3 items
    { id: 1, title: 'Spaghetti in Meat Sauce', price: 5.76, image: '/images/food2.png', category: 'Foods' },
    { id: 2, title: 'Grilled Chicken Breast', price: 8.50, image: '/images/food.png', category: 'Foods' },
    { id: 3, title: 'Beef Burger Deluxe', price: 7.25, image: '/images/souce.png', category: 'Foods' },
    // Drinks - 2 items
    { id: 4, title: 'Fresh Orange Juice', price: 3.50, image: '/images/drink1.png', category: 'Drinks' },
    { id: 5, title: 'Iced Coffee', price: 4.00, image: '/images/drink2.png', category: 'Drinks' },
    // Desserts - 3 items
    { id: 6, title: 'Strawberry Banana Swirl', price: 3.76, image: '/images/desert.png', category: 'Desserts' },
    { id: 7, title: 'Chocolate Cake', price: 5.50, image: '/images/desert.png', category: 'Desserts' },
    { id: 8, title: 'Vanilla Ice Cream', price: 3.25, image: '/images/desert.png', category: 'Desserts' },
  ];

  get products() {
    if (this.activeCategory === 'All') {
      return this.allProducts;
    }
    return this.allProducts.filter(p => p.category === this.activeCategory);
  }

  cart: CartItem[] = [];
  private unsubscribe?: () => void;

  showCharge = false;
  showOrdersModal = false;
  showChargeModal = false; // Mobile charge panel modal

  onCategoryChange(c: string) { 
    this.activeCategory = c; 
  }

  getCategoryCount(category: string): number {
    if (category === 'All') {
      return this.allProducts.length;
    }
    return this.allProducts.filter(p => p.category === category).length;
  }

  getAllCategoryCounts(): CategoryCounts {
    const counts: CategoryCounts = {};
    this.categories.forEach(cat => {
      counts[cat] = this.getCategoryCount(cat);
    });
    return counts;
  }

  addToCart(p: Product, qty: number) {
    if (qty <= 0) {
      store.dispatch(removeCart({ id: p.id }));
      return;
    }
    // We only need to dispatch add once; subsequent clicks increase via plus
    const exists = this.cart.find(i => i.id === p.id);
    if (exists) {
      store.dispatch(plusCart({ id: p.id }));
    } else {
      store.dispatch(addToCartAction({ id: p.id, name: p.title, image: p.image, price: p.price }));
    }
  }

  inc(item: any) { store.dispatch(plusCart({ id: item.id })); }
  dec(item: any) { store.dispatch(minusCart({ id: item.id })); }
  remove(item: any) { store.dispatch(removeCart({ id: item.id })); }

  get subTotal() { return this.cart.reduce((s, i) => s + i.price * i.quantity, 0); }
  get tax() { return +(this.subTotal * 0.10).toFixed(2); }
  get discount() { return 0.28; }
  get total() { return +(this.subTotal - this.discount + this.tax).toFixed(2); }

  ngOnInit(): void {
    // On desktop, show the charge panel by default
    if (typeof window !== 'undefined') {
      this.showCharge = window.innerWidth > 1340;
    }
    const snap = selectCartState();
    this.cart = snap.cartItems.map(i => ({ id: i.id, title: i.name, image: i.image, price: i.price, quantity: i.quantity }));
    this.unsubscribe = store.subscribe(() => {
      const state = selectCartState();
      this.cart = state.cartItems.map(i => ({ id: i.id, title: i.name, image: i.image, price: i.price, quantity: i.quantity }));
    });
  }

  ngOnDestroy(): void {
    if (this.unsubscribe) this.unsubscribe();
  }

  getQty(id: number | string): number {
    const item = this.cart.find(i => i.id === id);
    return item ? item.quantity : 0;
  }

  decProduct(p: { id: number | string }) {
    store.dispatch(minusCart({ id: p.id }));
  }

  // Open/close behavior dependent on screen size
  openChargePanel(): void {
    if (typeof window !== 'undefined' && window.innerWidth <= 1340) {
      this.showChargeModal = true; // mobile: open charge panel modal
    } else {
      this.showCharge = true; // desktop: show side panel
    }
  }

  closeChargePanel(): void {
    if (typeof window !== 'undefined' && window.innerWidth <= 1340) {
      this.showChargeModal = false;
    } else {
      this.showCharge = false;
    }
  }
}
