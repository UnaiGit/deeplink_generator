import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BaseModalComponent } from '../../../../../shared/components/modal/base-modal';
import { ModalConfig } from '../../../../../shared/components/modal/modal-config.type';
import { CartItem } from '../../../../../store/cart/cartSlice';

export interface Client {
  id: string;
  name: string;
  avatar?: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface SpecialChargeData {
  tableNumber: string | number;
  clients: Client[];
  orderItems: OrderItem[];
  subTotal: number;
  discount: number;
  tax: number;
  total: number;
}

export interface SpecialChargeResult {
  mode: 'individual' | 'company';
  selectedPayers: string[];
  splitType: '50-50' | 'divide-between';
  coupons: {
    global: number;
    perPerson: { [key: string]: number };
    perLine: { [key: string]: number };
  };
  companyData?: {
    legalName: string;
    vatTin: string;
    invoiceEmail: string;
  };
}

@Component({
  selector: 'app-special-charge-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, BaseModalComponent],
  templateUrl: './special-charge-modal.html',
  styleUrl: './special-charge-modal.scss'
})
export class SpecialChargeModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() specialChargeData: SpecialChargeData | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<SpecialChargeResult>();

  modalConfig: ModalConfig = {
    position: 'right',
    animation: 'slide',
    width: '480px',
    height: '100vh',
    borderRadius: '0',
    closeOnOverlayClick: true,
    closeOnEscape: true,
    customClass: 'special-charge-modal'
  };

  // Client selection (multiple)
  selectedClientFilter: Set<string> = new Set(['all']);
  
  // Mode
  mode: 'individual' | 'company' = 'individual';

  // Payers selection
  selectedPayers: Set<string> = new Set();

  // Split
  splitType: '50-50' | 'divide-between' = '50-50';

  // Coupons
  globalCoupons = 2;
  perPersonCoupons: { [key: string]: number } = {};
  perLineCoupons: { [key: string]: number } = {};

  // Company mode fields
  legalName = '';
  vatTin = '';
  invoiceEmail = '';

  // Validation
  splitError = '';

  ngOnInit(): void {
    if (this.specialChargeData?.clients) {
      // Initialize per-person coupons
      this.specialChargeData.clients.forEach(client => {
        this.perPersonCoupons[client.id] = 2;
      });

      // Initialize per-line coupons
      this.specialChargeData.orderItems?.forEach((item, index) => {
        this.perLineCoupons[item.name] = 2;
      });

      // Pre-select first two clients for 50/50
      if (this.specialChargeData.clients.length >= 2) {
        this.selectedPayers.add(this.specialChargeData.clients[0].id);
        this.selectedPayers.add(this.specialChargeData.clients[1].id);
      }
      
      // Validate split on initialization
      this.validateSplit();
    }
  }

  onClientFilterClick(clientId: string): void {
    // Handle "all" selection
    if (clientId === 'all') {
      if (this.selectedClientFilter.has('all')) {
        // If "all" is already selected, deselect it and select all clients
        this.selectedClientFilter.clear();
        this.specialChargeData?.clients?.forEach(client => this.selectedClientFilter.add(client.id));
      } else {
        // Select "all" and deselect individual clients
        this.selectedClientFilter.clear();
        this.selectedClientFilter.add('all');
      }
    } else {
      // Handle individual client selection
      if (this.selectedClientFilter.has(clientId)) {
        this.selectedClientFilter.delete(clientId);
      } else {
        this.selectedClientFilter.delete('all'); // Remove "all" when selecting individual client
        this.selectedClientFilter.add(clientId);
      }
      
      // If no clients selected, select "all" by default
      if (this.selectedClientFilter.size === 0) {
        this.selectedClientFilter.add('all');
      }
    }
  }

  isClientFilterSelected(clientId: string): boolean {
    return this.selectedClientFilter.has(clientId);
  }

  getSelectedClients(): Client[] {
    if (!this.specialChargeData?.clients) return [];
    
    // If "all" is selected, don't show per-person coupons
    if (this.selectedClientFilter.has('all')) {
      return [];
    }
    
    // Only return individually selected clients
    return this.specialChargeData.clients.filter(client => 
      this.selectedClientFilter.has(client.id)
    );
  }

  getPayerClients(): Client[] {
    if (!this.specialChargeData?.clients) return [];
    
    // Return clients based on selected payers
    return this.specialChargeData.clients.filter(client => 
      this.selectedPayers.has(client.id)
    );
  }

  onModeToggle(): void {
    this.mode = this.mode === 'individual' ? 'company' : 'individual';
  }

  onPayerToggle(clientId: string): void {
    if (this.selectedPayers.has(clientId)) {
      this.selectedPayers.delete(clientId);
    } else {
      this.selectedPayers.add(clientId);
    }
    this.validateSplit();
  }

  onSplitTypeChange(type: '50-50' | 'divide-between'): void {
    this.splitType = type;
    this.validateSplit();
  }

  validateSplit(): void {
    this.splitError = '';
    
    if (this.splitType === '50-50') {
      if (this.selectedPayers.size !== 2) {
        this.splitError = `Split mismatch. For 50/50 select exactly 2 payers. For Divide N, select N payers or adjust N.`;
      }
    } else if (this.splitType === 'divide-between') {
      if (this.selectedPayers.size < 2) {
        this.splitError = `Split mismatch. For 50/50 select exactly 2 payers. For Divide N, select N payers or adjust N.`;
      }
    }
  }

  isPayerSelected(clientId: string): boolean {
    return this.selectedPayers.has(clientId);
  }

  getSelectedClient(clientId: string): Client | undefined {
    return this.specialChargeData?.clients.find(c => c.id === clientId);
  }

  onClose(): void {
    this.close.emit();
  }

  onConfirm(): void {
    // Validate before confirming
    if (this.mode === 'individual' && this.splitError) {
      return;
    }

    if (this.mode === 'company') {
      if (!this.legalName || !this.vatTin || !this.invoiceEmail) {
        return;
      }
    }

    const result: SpecialChargeResult = {
      mode: this.mode,
      selectedPayers: Array.from(this.selectedPayers),
      splitType: this.splitType,
      coupons: {
        global: this.globalCoupons,
        perPerson: { ...this.perPersonCoupons },
        perLine: { ...this.perLineCoupons }
      }
    };

    if (this.mode === 'company') {
      result.companyData = {
        legalName: this.legalName,
        vatTin: this.vatTin,
        invoiceEmail: this.invoiceEmail
      };
    }

    this.confirm.emit(result);
  }

  getButtonText(): string {
    return this.mode === 'company' ? 'Confirm & charge' : 'Confirm & close table';
  }
}

