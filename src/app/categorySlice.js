import { createSlice } from '@reduxjs/toolkit';

// Load categories from localStorage or start with empty array
const persistedCategories = JSON.parse(localStorage.getItem('categories')) || [];

export const categorySlice = createSlice({
  name: 'category',
  initialState: {
    categories: persistedCategories,
    successMessage: null,
    errorMessage: null,
  },
  reducers: {
    // 🔹 Fetch categories from localStorage
    fetchCategories(state) {
      const saved = JSON.parse(localStorage.getItem("categories")) || [];
      state.categories = saved;
      state.successMessage = "Categories loaded successfully!";
    },

    // Set categories (bulk replace)
    setCategories(state, action) {
      state.categories = action.payload;
      localStorage.setItem('categories', JSON.stringify(state.categories));
      state.successMessage = "Categories set successfully!";
    },

    // Add new category
    addCategory(state, action) {
      const newCategory = {
        _id: action.payload._id || Date.now().toString(),
        ...action.payload,
      };
      state.categories.push(newCategory);
      localStorage.setItem('categories', JSON.stringify(state.categories));
      state.successMessage = "Category added successfully!";
    },

    // Update category by id
    updateCategory(state, action) {
      const { id, data } = action.payload;
      const index = state.categories.findIndex((cat) => cat._id === id);
      if (index !== -1) {
        state.categories[index] = { ...state.categories[index], ...data };
        localStorage.setItem('categories', JSON.stringify(state.categories));
        state.successMessage = "Category updated successfully!";
      } else {
        state.errorMessage = "Category not found!";
      }
    },

    // Delete category by id
    deleteCategory(state, action) {
      const beforeLength = state.categories.length;
      state.categories = state.categories.filter((cat) => cat._id !== action.payload);
      localStorage.setItem('categories', JSON.stringify(state.categories));
      if (state.categories.length < beforeLength) {
        state.successMessage = "Category deleted successfully!";
      } else {
        state.errorMessage = "Category not found!";
      }
    },

    // Clear all categories
    clearCategories(state) {
      state.categories = [];
      localStorage.removeItem('categories');
      state.successMessage = "All categories cleared!";
    },

    // Clear messages
    clearCategoryMessages(state) {
      state.successMessage = null;
      state.errorMessage = null;
    },
  },
});

export const { 
  fetchCategories,   // ✅ ab export ho gaya
  setCategories, 
  addCategory, 
  updateCategory, 
  deleteCategory, 
  clearCategories,
  clearCategoryMessages,
} = categorySlice.actions;

export default categorySlice.reducer;
