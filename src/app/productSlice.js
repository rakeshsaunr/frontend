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
      state.products.push(action.payload);
    },
    removeProduct(state, action) {
      state.products = state.products.filter(p => p.id !== action.payload && p._id !== action.payload);
    },
    updateProduct(state, action) {
      const index = state.products.findIndex(p => p.id === action.payload.id || p._id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
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
