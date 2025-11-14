import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BaseModalComponent } from '../../../../../shared/components/modal/base-modal';
import { ModalConfig } from '../../../../../shared/components/modal/modal-config.type';
import { Button } from '../../../../../shared/components/button/button';

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  isIncluded: boolean;
}

export interface ProductTopping {
  id: string;
  name: string;
  price: number;
  isIncluded: boolean;
}

export interface ProductDetailData {
  id: string;
  name: string;
  image: string;
  category: string;
  basePrice: number;
  variants?: ProductVariant[];
  sauces?: ProductVariant[];
  toppings?: ProductTopping[];
  maxToppings?: number;
}

export interface ProductDetailResult {
  productId: string;
  quantity: number;
  selectedVariant?: ProductVariant;
  selectedSauce?: ProductVariant;
  selectedToppings: ProductTopping[];
  notes: string;
  totalPrice: number;
}

@Component({
  selector: 'app-product-detail-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, BaseModalComponent, Button],
  templateUrl: './product-detail-modal.html',
  styleUrl: './product-detail-modal.scss'
})
export class ProductDetailModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() productData: ProductDetailData | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() addToCart = new EventEmitter<ProductDetailResult>();

  modalConfig: ModalConfig = {
    position: 'right',
    animation: 'slide',
    width: '480px',
    height: '100vh',
    borderRadius: '0',
    closeOnOverlayClick: true,
    closeOnEscape: true,
    customClass: 'product-detail-modal'
  };

  selectedVariant: ProductVariant | null = null;
  selectedSauce: ProductVariant | null = null;
  selectedToppings: Set<string> = new Set();
  notes: string = '';
  quantity: number = 1;

  ngOnInit(): void {
    this.initializeDefaults();
  }

  initializeDefaults(): void {
    if (!this.productData) return;

    // Set default variant (first one or included one)
    if (this.productData.variants && this.productData.variants.length > 0) {
      this.selectedVariant = this.productData.variants.find(v => v.isIncluded) || this.productData.variants[0];
    }

    // Set default sauce (first one or included one)
    if (this.productData.sauces && this.productData.sauces.length > 0) {
      this.selectedSauce = this.productData.sauces.find(s => s.isIncluded) || this.productData.sauces[0];
    }

    // Set default toppings (included ones)
    if (this.productData.toppings) {
      this.selectedToppings.clear();
      this.productData.toppings.forEach(topping => {
        if (topping.isIncluded) {
          this.selectedToppings.add(topping.id);
        }
      });
    }
  }

  onVariantSelect(variant: ProductVariant): void {
    this.selectedVariant = variant;
  }

  onSauceSelect(sauce: ProductVariant): void {
    this.selectedSauce = sauce;
  }

  onToppingToggle(topping: ProductTopping): void {
    const maxToppings = this.productData?.maxToppings || 999;
    
    if (this.selectedToppings.has(topping.id)) {
      this.selectedToppings.delete(topping.id);
    } else {
      if (this.selectedToppings.size < maxToppings) {
        this.selectedToppings.add(topping.id);
      }
    }
  }

  isToppingSelected(toppingId: string): boolean {
    return this.selectedToppings.has(toppingId);
  }

  canSelectMoreToppings(): boolean {
    const maxToppings = this.productData?.maxToppings || 999;
    return this.selectedToppings.size < maxToppings;
  }

  getTotalPrice(): number {
    let total = this.productData?.basePrice || 0;

    // Add variant price
    if (this.selectedVariant && !this.selectedVariant.isIncluded) {
      total += this.selectedVariant.price;
    }

    // Add sauce price
    if (this.selectedSauce && !this.selectedSauce.isIncluded) {
      total += this.selectedSauce.price;
    }

    // Add toppings price
    if (this.productData?.toppings) {
      this.productData.toppings.forEach(topping => {
        if (this.selectedToppings.has(topping.id) && !topping.isIncluded) {
          total += topping.price;
        }
      });
    }

    return total * this.quantity;
  }

  increaseQuantity(): void {
    this.quantity++;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onAddToCart(): void {
    if (!this.productData) return;

    const selectedToppingsArray = this.productData.toppings?.filter(t => 
      this.selectedToppings.has(t.id)
    ) || [];

    const result: ProductDetailResult = {
      productId: this.productData.id,
      quantity: this.quantity,
      selectedVariant: this.selectedVariant || undefined,
      selectedSauce: this.selectedSauce || undefined,
      selectedToppings: selectedToppingsArray,
      notes: this.notes,
      totalPrice: this.getTotalPrice()
    };

    this.addToCart.emit(result);
    this.onClose();
  }
}

