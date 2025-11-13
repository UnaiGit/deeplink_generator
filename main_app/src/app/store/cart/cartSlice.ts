import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type CartItem = {
  id: number | string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  tableId?: number | string; // Table ID for table-specific carts
  category?: string; // Category for grouping (STARTERS, MAIN DISH, DESSERTS)
  clientId?: string; // Client ID for filtering
  status?: 'open' | 'locked' | 'delivered' | 'billing-only'; // Item status
  selected?: boolean; // For checkbox selection
};

export type PaymentInfo = {
  splitType: 'one-pay' | '50-50' | 'divide-between';
  numberOfPeople?: number;
  tipPercentage: number;
  customTip?: number;
  paymentMethod: 'cash' | 'card' | 'charge-to-room';
  finalTotal: number;
  specialChargeData?: any;
  timestamp: number;
};

export type CartState = {
  cartItems: CartItem[];
  totalQuantity: number;
  totalAmount: number;
  tableCarts: { [tableId: string]: CartItem[] }; // Store carts per table
  payments: { [tableId: string]: PaymentInfo }; // Store payment info per table
};

// Load cart from localStorage
const loadCartFromStorage = (): CartState => {
  try {
    const serializedState = localStorage.getItem('cartState');
    if (serializedState === null) {
      return {
        cartItems: [],
        totalQuantity: 0,
        totalAmount: 0,
        tableCarts: {},
        payments: {},
      };
    }
    const parsed = JSON.parse(serializedState);
    // Recalculate totals to ensure consistency
    const totalQuantity = parsed.cartItems.reduce((sum: number, i: CartItem) => sum + i.quantity, 0);
    const totalAmount = parsed.cartItems.reduce((sum: number, i: CartItem) => sum + i.price * i.quantity, 0);
    return {
      cartItems: parsed.cartItems || [],
      totalQuantity,
      totalAmount,
      tableCarts: parsed.tableCarts || {},
      payments: parsed.payments || {},
    };
  } catch (err) {
    console.error('Error loading cart from localStorage:', err);
    return {
      cartItems: [],
      totalQuantity: 0,
      totalAmount: 0,
      tableCarts: {},
      payments: {},
    };
  }
};

// Save cart to localStorage
const saveCartToStorage = (state: CartState) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('cartState', serializedState);
  } catch (err) {
    console.error('Error saving cart to localStorage:', err);
  }
};

const initialState: CartState = loadCartFromStorage();

const recalcTotals = (state: CartState, tableId?: number | string) => {
  if (tableId !== undefined) {
    // Recalculate for specific table
    const tableCart = state.tableCarts[String(tableId)] || [];
    state.totalQuantity = tableCart.reduce((sum, i) => sum + i.quantity, 0);
    state.totalAmount = tableCart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  } else {
    // Recalculate for global cart
  state.totalQuantity = state.cartItems.reduce((sum, i) => sum + i.quantity, 0);
  state.totalAmount = state.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }
  // Save to localStorage after every change
  saveCartToStorage(state);
};

const getTableCart = (state: CartState, tableId: number | string): CartItem[] => {
  return state.tableCarts[String(tableId)] || [];
};

const setTableCart = (state: CartState, tableId: number | string, items: CartItem[]): void => {
  state.tableCarts[String(tableId)] = items;
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (
      state,
      action: PayloadAction<{
        id: number | string;
        name: string;
        image: string;
        price: number;
        tableId?: number | string;
        category?: string;
      }>
    ) => {
      const { id, name, image, price, tableId, category } = action.payload;
      
      if (tableId !== undefined) {
        // Table-specific cart
        const tableCart = getTableCart(state, tableId);
        const existing = tableCart.find((i) => i.id === id);
        if (existing) {
          existing.quantity += 1;
        } else {
          tableCart.push({ id, name, image, price, quantity: 1, tableId, category });
        }
        setTableCart(state, tableId, tableCart);
        recalcTotals(state, tableId);
      } else {
        // Global cart (for backward compatibility)
      const existing = state.cartItems.find((i) => i.id === id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.cartItems.push({ id, name, image, price, quantity: 1, category });
      }
      recalcTotals(state);
      }
    },

    plusCart: (state, action: PayloadAction<{ id: number | string; tableId?: number | string }>) => {
      const { id, tableId } = action.payload;
      
      if (tableId !== undefined) {
        const tableCart = getTableCart(state, tableId);
        const item = tableCart.find((i) => i.id === id);
        if (item) {
          item.quantity += 1;
          setTableCart(state, tableId, tableCart);
          recalcTotals(state, tableId);
        }
      } else {
        const item = state.cartItems.find((i) => i.id === id);
      if (item) {
        item.quantity += 1;
        recalcTotals(state);
      }
      }
    },

    minusCart: (state, action: PayloadAction<{ id: number | string; tableId?: number | string }>) => {
      const { id, tableId } = action.payload;
      
      if (tableId !== undefined) {
        const tableCart = getTableCart(state, tableId);
        const idx = tableCart.findIndex((i) => i.id === id);
        if (idx !== -1) {
          const it = tableCart[idx];
          it.quantity -= 1;
          if (it.quantity <= 0) tableCart.splice(idx, 1);
          setTableCart(state, tableId, tableCart);
          recalcTotals(state, tableId);
        }
      } else {
        const idx = state.cartItems.findIndex((i) => i.id === id);
      if (idx !== -1) {
        const it = state.cartItems[idx];
        it.quantity -= 1;
        if (it.quantity <= 0) state.cartItems.splice(idx, 1);
        recalcTotals(state);
      }
      }
    },

    removeCart: (state, action: PayloadAction<{ id: number | string; tableId?: number | string }>) => {
      const { id, tableId } = action.payload;
      
      if (tableId !== undefined) {
        const tableCart = getTableCart(state, tableId);
        setTableCart(state, tableId, tableCart.filter((i) => i.id !== id));
        recalcTotals(state, tableId);
      } else {
        state.cartItems = state.cartItems.filter((i) => i.id !== id);
      recalcTotals(state);
      }
    },

    clearCart: (state, action?: PayloadAction<{ tableId?: number | string }>) => {
      const tableId = action?.payload?.tableId;
      if (tableId !== undefined) {
        // Clear specific table cart
        setTableCart(state, tableId, []);
        recalcTotals(state, tableId);
      } else {
        // Clear global cart
      state.cartItems = [];
      state.totalAmount = 0;
      state.totalQuantity = 0;
      saveCartToStorage(state);
      }
    },

    // Update cart item status
    updateCartItemStatus: (
      state,
      action: PayloadAction<{
        itemId: number | string;
        status: 'open' | 'locked' | 'delivered' | 'billing-only';
        tableId?: string | number;
      }>
    ) => {
      const { itemId, status, tableId } = action.payload;
      
      if (tableId !== undefined) {
        const cart = getTableCart(state, tableId);
        const item = cart.find(i => i.id === itemId);
        if (item) {
          item.status = status;
          setTableCart(state, tableId, cart);
        }
      } else {
        const item = state.cartItems.find(i => i.id === itemId);
        if (item) {
          item.status = status;
        }
      }
      
      saveCartToStorage(state);
    },

    // Update multiple items status
    updateMultipleItemsStatus: (
      state,
      action: PayloadAction<{
        itemIds: (number | string)[];
        status: 'open' | 'locked' | 'delivered' | 'billing-only';
        tableId?: string | number;
      }>
    ) => {
      const { itemIds, status, tableId } = action.payload;
      
      if (tableId !== undefined) {
        const cart = getTableCart(state, tableId);
        cart.forEach(item => {
          if (itemIds.includes(item.id)) {
            item.status = status;
          }
        });
        setTableCart(state, tableId, cart);
      } else {
        state.cartItems.forEach(item => {
          if (itemIds.includes(item.id)) {
            item.status = status;
          }
        });
      }
      
      saveCartToStorage(state);
    },
    
    savePayment(
      state,
      action: PayloadAction<{ tableId: number | string; paymentInfo: PaymentInfo }>
    ) {
      const { tableId, paymentInfo } = action.payload;
      state.payments[tableId] = {
        ...paymentInfo,
        timestamp: Date.now(),
      };
      saveCartToStorage(state);
    },
    
    clearPayment(
      state,
      action: PayloadAction<{ tableId: number | string }>
    ) {
      const { tableId } = action.payload;
      delete state.payments[tableId];
      saveCartToStorage(state);
    },
  },
});

export const { 
  addToCart, 
  plusCart, 
  minusCart, 
  removeCart, 
  clearCart,
  updateCartItemStatus,
  updateMultipleItemsStatus,
  savePayment,
  clearPayment,
} = cartSlice.actions;
export default cartSlice.reducer;
export type CartReducer = ReturnType<typeof cartSlice.reducer>;


