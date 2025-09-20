// src/app/cartSlice.js
import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "cart";
const persistedCart = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

function calculateCount(items) {
  return items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
}

// normalize helpers
function getId(obj) {
  if (!obj) return "";
  // prefer _id then id
  return obj._id ?? obj.id ?? "";
}
function norm(v) {
  if (v == null) return "";
  return String(v);
}

function matchItem(a, b) {
  // a = existing item in state, b = search object / payload
  return (
    norm(getId(a)) === norm(getId(b)) &&
    norm(a.size) === norm(b.size) &&
    norm(a.color) === norm(b.color) &&
    norm(a.sku) === norm(b.sku)
  );
}

export const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: persistedCart,
    count: calculateCount(persistedCart),
    lastAdded: null,
  },
  reducers: {
    addToCart(state, action) {
      const payload = action.payload || {};
      const searchObj = {
        _id: payload._id ?? payload.id ?? "",
        size: payload.size ?? "",
        color: payload.color ?? "",
        sku: payload.sku ?? "",
      };

      const idx = state.items.findIndex((it) => matchItem(it, searchObj));
      if (idx >= 0) {
        state.items[idx].quantity = (Number(state.items[idx].quantity) || 0) + (Number(payload.quantity) || 1);
      } else {
        state.items.push({
          ...payload,
          // ensure id consistency in stored item (keep _id if exists else id)
          _id: payload._id ?? payload.id ?? "",
          quantity: Number(payload.quantity) || 1,
        });
      }

      state.count = calculateCount(state.items);
      state.lastAdded = {
        _id: payload._id ?? payload.id ?? "",
        name: payload.name ?? "",
        price: Number(payload.price) || 0,
        image: payload.image ?? "",
        quantity: Number(payload.quantity) || 1,
        size: payload.size ?? "",
        color: payload.color ?? "",
        sku: payload.sku ?? "",
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    },

    incrementCartItem(state, action) {
      const payload = action.payload || {};
      const searchObj = {
        _id: payload._id ?? payload.id ?? "",
        size: payload.size ?? "",
        color: payload.color ?? "",
        sku: payload.sku ?? "",
      };
      const item = state.items.find((i) => matchItem(i, searchObj));
      if (item) {
        item.quantity = (Number(item.quantity) || 0) + 1;
        state.lastAdded = { ...item };
      }
      state.count = calculateCount(state.items);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    },

    decrementCartItem(state, action) {
      const payload = action.payload || {};
      const searchObj = {
        _id: payload._id ?? payload.id ?? "",
        size: payload.size ?? "",
        color: payload.color ?? "",
        sku: payload.sku ?? "",
      };
      const idx = state.items.findIndex((i) => matchItem(i, searchObj));
      if (idx >= 0) {
        const it = state.items[idx];
        if ((Number(it.quantity) || 0) > 1) {
          it.quantity = (Number(it.quantity) || 0) - 1;
          state.lastAdded = { ...it };
        } else {
          state.items.splice(idx, 1);
          state.lastAdded = null;
        }
      }
      state.count = calculateCount(state.items);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    },

    removeCartItem(state, action) {
      const payload = action.payload || {};
      const searchObj = {
        _id: payload._id ?? payload.id ?? "",
        size: payload.size ?? "",
        color: payload.color ?? "",
        sku: payload.sku ?? "",
      };
      state.items = state.items.filter((i) => !matchItem(i, searchObj));
      state.count = calculateCount(state.items);
      state.lastAdded = null;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    },

    clearCart(state) {
      state.items = [];
      state.count = 0;
      state.lastAdded = null;
      localStorage.removeItem(STORAGE_KEY);
    },

    setCart(state, action) {
      state.items = Array.isArray(action.payload) ? action.payload : [];
      state.count = calculateCount(state.items);
      state.lastAdded = null;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    },
  },
});

export const {
  addToCart,
  incrementCartItem,
  decrementCartItem,
  removeCartItem,
  clearCart,
  setCart,
} = cartSlice.actions;

export default cartSlice.reducer;
