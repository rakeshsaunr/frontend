import { createSlice } from '@reduxjs/toolkit';

// Load categories from localStorage or start with empty array
const persistedCategories = JSON.parse(localStorage.getItem('categories')) || [];

export const categorySlice = createSlice({
  name: 'category',
  initialState: {
    categories: persistedCategories,
  },
  reducers: {
    setCategories(state, action) {
      state.categories = action.payload;
      localStorage.setItem('categories', JSON.stringify(action.payload));
    },
    clearCategories(state) {
      state.categories = [];
      localStorage.removeItem('categories');
    },
  },
});

export const { setCategories, clearCategories } = categorySlice.actions;
export default categorySlice.reducer;
