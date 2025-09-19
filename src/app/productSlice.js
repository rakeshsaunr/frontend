// productSlice.js
import { createSlice } from '@reduxjs/toolkit';

export const productSlice = createSlice({
  name: 'product',
  initialState: {
    products: [],
    loading: false,
    error: null,
  },
  reducers: {
    fetchProductsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchProductsSuccess(state, action) {
      state.loading = false;
      state.products = action.payload;
    },
    fetchProductsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    addProduct(state, action) {
      const product = action.payload;
      if (!product) return;
      state.products.push(product);
    },
    removeProduct(state, action) {
      const targetId = action.payload && (action.payload._id || action.payload.id || action.payload);
      state.products = state.products.filter(
        (p) => p._id !== targetId && p.id !== targetId
      );
    },
    updateProduct(state, action) {
      const updated = action.payload;
      if (!updated) return;
      const targetId = updated._id || updated.id;
      const index = state.products.findIndex(
        (p) => p._id === targetId || p.id === targetId
      );
      if (index !== -1) {
        state.products[index] = { ...state.products[index], ...updated };
      } else {
        // If not found, append
        state.products.push(updated);
      }
    },
  },
});

export const {
  fetchProductsStart,
  fetchProductsSuccess,
  fetchProductsFailure,
  addProduct,
  removeProduct,
  updateProduct,
} = productSlice.actions;

export const selectProducts = state => state.product.products;
export const selectLoading = state => state.product.loading;
export const selectError = state => state.product.error;

export default productSlice.reducer;
