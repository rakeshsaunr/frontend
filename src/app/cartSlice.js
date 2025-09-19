import { createSlice } from '@reduxjs/toolkit';

// Load cart from localStorage or start with empty array
const persistedCart = JSON.parse(localStorage.getItem('cart')) || [];

export const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: persistedCart,
  },
  reducers: {
    addToCart(state, action) {
      // Find if item with same _id, size, color, sku exists
      const { _id, size, color, sku } = action.payload;
      const existingItem = state.items.find(
        (item) =>
          item._id === _id &&
          item.size === size &&
          item.color === color &&
          item.sku === sku
      );
      if (existingItem) {
        // Increase quantity by payload.quantity or 1
        existingItem.quantity += action.payload.quantity || 1;
      } else {
        // Add new item with quantity
        state.items.push({
          ...action.payload,
          quantity: action.payload.quantity || 1,
        });
      }
      // Persist to localStorage
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    removeFromCart(state, action) {
      state.items = state.items.filter((it) => it.id !== action.payload);
      localStorage.setItem("cart", JSON.stringify(state.items));
    },
    clearCart(state) {
      state.items = [];
      localStorage.removeItem("cart");
    },
    setCart(state, action) {
      state.items = action.payload;
      localStorage.setItem("cart", JSON.stringify(state.items));
    },
  },
});

export const { addToCart, removeFromCart, clearCart, setCart } = cartSlice.actions;
export default cartSlice.reducer;
