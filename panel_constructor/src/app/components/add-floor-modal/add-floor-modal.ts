import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ICON_PATHS } from '../../core/constants/icon.constants';

export type PricingPolicy = 'baseFee' | 'percentageSurcharge' | 'minimumSpend';

export interface AddFloorFormData {
  name: string;
  timeLimit: string;
  pricingPolicy: PricingPolicy;
  currency: string;
  baseFeeAmount: string;
  percentageSurcharge: string;
  minimumSpendAmount: string;
}

@Component({
  selector: 'app-add-floor-modal',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './add-floor-modal.html',
  styleUrl: './add-floor-modal.scss',
})
export class AddFloorModal {
  isOpen = input<boolean>(false);
  close = output<void>();
  save = output<AddFloorFormData>();

  floorsIcon = ICON_PATHS.floors;
  
  formData: AddFloorFormData = {
    name: '',
    timeLimit: '',
    pricingPolicy: 'minimumSpend',
    currency: 'USD',
    baseFeeAmount: '0',
    percentageSurcharge: '0',
    minimumSpendAmount: '0',
  };

  currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
  ];

  onOverlayClick(): void {
    this.close.emit();
  }

  onModalClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  onCancel(): void {
    this.resetForm();
    this.close.emit();
  }

  onAdd(): void {
    if (this.formData.name.trim()) {
      this.save.emit({ ...this.formData });
      this.resetForm();
      this.close.emit();
    }
  }

  private resetForm(): void {
    this.formData = {
      name: '',
      timeLimit: '',
      pricingPolicy: 'minimumSpend',
      currency: 'USD',
      baseFeeAmount: '0',
      percentageSurcharge: '0',
      minimumSpendAmount: '0',
    };
  }

  get selectedCurrency(): { code: string; symbol: string; name: string } {
    return this.currencies.find(c => c.code === this.formData.currency) || this.currencies[0];
  }

  get isBaseFee(): boolean {
    return this.formData.pricingPolicy === 'baseFee';
  }

  get isPercentageSurcharge(): boolean {
    return this.formData.pricingPolicy === 'percentageSurcharge';
  }

  get isMinimumSpend(): boolean {
    return this.formData.pricingPolicy === 'minimumSpend';
  }
}

