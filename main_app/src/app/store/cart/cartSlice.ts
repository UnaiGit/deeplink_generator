import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type CartItem = {
  id: number | string;
  name: string;
  image: string;
  price: number;
  quantity: number;
};

export type CartState = {
  cartItems: CartItem[];
  totalQuantity: number;
  totalAmount: number;
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
    };
  } catch (err) {
    console.error('Error loading cart from localStorage:', err);
    return {
      cartItems: [],
      totalQuantity: 0,
      totalAmount: 0,
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

const recalcTotals = (state: CartState) => {
  state.totalQuantity = state.cartItems.reduce((sum, i) => sum + i.quantity, 0);
  state.totalAmount = state.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  // Save to localStorage after every change
  saveCartToStorage(state);
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
      }>
    ) => {
      const { id, name, image, price } = action.payload;
      const existing = state.cartItems.find((i) => i.id === id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.cartItems.push({ id, name, image, price, quantity: 1 });
      }
      recalcTotals(state);
    },

    plusCart: (state, action: PayloadAction<{ id: number | string }>) => {
      const item = state.cartItems.find((i) => i.id === action.payload.id);
      if (item) {
        item.quantity += 1;
        recalcTotals(state);
      }
    },

    minusCart: (state, action: PayloadAction<{ id: number | string }>) => {
      const idx = state.cartItems.findIndex((i) => i.id === action.payload.id);
      if (idx !== -1) {
        const it = state.cartItems[idx];
        it.quantity -= 1;
        if (it.quantity <= 0) state.cartItems.splice(idx, 1);
        recalcTotals(state);
      }
    },

    removeCart: (state, action: PayloadAction<{ id: number | string }>) => {
      state.cartItems = state.cartItems.filter((i) => i.id !== action.payload.id);
      recalcTotals(state);
    },

    clearCart: (state) => {
      state.cartItems = [];
      state.totalAmount = 0;
      state.totalQuantity = 0;
      saveCartToStorage(state);
    },
  },
});

export const { addToCart, plusCart, minusCart, removeCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
export type CartReducer = ReturnType<typeof cartSlice.reducer>;


