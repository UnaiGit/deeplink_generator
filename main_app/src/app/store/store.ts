import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cart/cartSlice';
import employeeReducer from './employee/employeeSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    employee: employeeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Lightweight helpers to subscribe in non-React apps (like Angular)
export const selectCartState = () => store.getState().cart;
export const selectEmployeeState = () => store.getState().employee;


