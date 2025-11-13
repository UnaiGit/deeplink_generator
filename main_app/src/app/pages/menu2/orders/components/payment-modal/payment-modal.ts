import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BaseModalComponent } from '../../../../../shared/components/modal/base-modal';
import { ModalConfig } from '../../../../../shared/components/modal/modal-config.type';

export interface PaymentData {
  tableNumber: string | number;
  subTotal: number;
  discount: number;
  tax: number;
  total: number;
  clientsCount: number;
}

export interface PaymentResult {
  splitType: 'one-pay' | '50-50' | 'divide-between';
  numberOfPeople?: number;
  tipPercentage: number;
  customTip?: number;
  paymentMethod: 'cash' | 'card' | 'charge-to-room';
  finalTotal: number;
  specialChargeData?: any;
}

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, BaseModalComponent],
  templateUrl: './payment-modal.html',
  styleUrl: './payment-modal.scss'
})
export class PaymentModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() paymentData: PaymentData | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<PaymentResult>();
  @Output() openSpecialCharge = new EventEmitter<void>();

  modalConfig: ModalConfig = {
    position: 'right',
    animation: 'slide',
    width: '480px',
    height: '100vh',
    borderRadius: '0',
    closeOnOverlayClick: true,
    closeOnEscape: true,
    customClass: 'payment-modal'
  };

  // Split options
  splitType: 'one-pay' | '50-50' | 'divide-between' = 'one-pay';
  numberOfPeople = 3;
  peopleOptions = Array.from({ length: 10 }, (_, i) => i + 2); // 2-11

  // Tip options
  tipType: 'no-tip' | 'percentage' | 'custom' = 'no-tip';
  selectedTipPercentage = 0;
  customTipAmount = 0;
  tipPercentages = [10, 12, 15];

  // Payment method
  paymentMethod: 'cash' | 'card' | 'charge-to-room' = 'cash';

  // Calculated values
  tipAmount = 0;
  finalTotal = 0;
  perPersonAmount = 0;

  ngOnInit(): void {
    this.calculateTotals();
  }

  ngOnChanges(): void {
    this.calculateTotals();
  }

  onSplitTypeChange(type: 'one-pay' | '50-50' | 'divide-between'): void {
    this.splitType = type;
    if (type === '50-50') {
      this.numberOfPeople = 2;
    }
    this.calculateTotals();
  }

  onNumberOfPeopleChange(): void {
    this.calculateTotals();
  }

  onTipTypeChange(type: 'no-tip' | 'percentage' | 'custom'): void {
    this.tipType = type;
    if (type === 'no-tip') {
      this.selectedTipPercentage = 0;
      this.customTipAmount = 0;
    }
    this.calculateTotals();
  }

  onTipPercentageSelect(percentage: number): void {
    this.tipType = 'percentage';
    this.selectedTipPercentage = percentage;
    this.customTipAmount = 0;
    this.calculateTotals();
  }

  onCustomTipChange(): void {
    this.tipType = 'custom';
    this.selectedTipPercentage = 0;
    this.calculateTotals();
  }

  onPaymentMethodChange(method: 'cash' | 'card' | 'charge-to-room'): void {
    this.paymentMethod = method;
  }

  calculateTotals(): void {
    if (!this.paymentData) return;

    const baseTotal = this.paymentData.total;

    // Calculate tip
    if (this.tipType === 'percentage' && this.selectedTipPercentage > 0) {
      this.tipAmount = (baseTotal * this.selectedTipPercentage) / 100;
    } else if (this.tipType === 'custom') {
      this.tipAmount = this.customTipAmount || 0;
    } else {
      this.tipAmount = 0;
    }

    // Calculate final total
    this.finalTotal = baseTotal + this.tipAmount;

    // Calculate per person
    if (this.splitType === '50-50') {
      this.perPersonAmount = this.finalTotal / 2;
    } else if (this.splitType === 'divide-between') {
      this.perPersonAmount = this.finalTotal / this.numberOfPeople;
    } else {
      this.perPersonAmount = this.finalTotal;
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onConfirm(): void {
    const result: PaymentResult = {
      splitType: this.splitType,
      numberOfPeople: this.splitType === 'divide-between' ? this.numberOfPeople : this.splitType === '50-50' ? 2 : 1,
      tipPercentage: this.selectedTipPercentage,
      customTip: this.tipType === 'custom' ? this.customTipAmount : undefined,
      paymentMethod: this.paymentMethod,
      finalTotal: this.finalTotal
    };
    this.confirm.emit(result);
  }

  onSpecialChargeClick(): void {
    this.openSpecialCharge.emit();
  }

  getSplitDescription(): string {
    if (this.splitType === 'one-pay') {
      return '';
    } else if (this.splitType === '50-50') {
      return `Per person: $${this.perPersonAmount.toFixed(2)} (equal parts × 2)`;
    } else {
      return `Per person: $${this.perPersonAmount.toFixed(2)} (equal parts × ${this.numberOfPeople})`;
    }
  }
}

