// src/app/orderSlice.js
import { createSlice } from "@reduxjs/toolkit";

// Load orders from localStorage or start with empty array
const loadOrdersFromStorage = () => {
  try {
    const raw = localStorage.getItem("orders");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveOrdersToStorage = (orders) => {
  try {
    localStorage.setItem("orders", JSON.stringify(orders || []));
  } catch {
    // ignore storage errors
  }
};

const persistedOrders = loadOrdersFromStorage();

export const orderSlice = createSlice({
  name: "order",
  initialState: {
    orders: persistedOrders,
    loading: false,
    error: null,
  },
  reducers: {
    fetchOrdersStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchOrdersSuccess(state, action) {
      state.loading = false;
      state.orders = action.payload || [];
      saveOrdersToStorage(state.orders);
    },
    fetchOrdersFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // Local update reducers
    addOrderLocal(state, action) {
      const order = action.payload;
      if (!order) return;
      state.orders.push(order);
      saveOrdersToStorage(state.orders);
    },
    updateOrderLocal(state, action) {
      const updated = action.payload;
      if (!updated) return;
      const targetId = updated._id || updated.id;
      const index = state.orders.findIndex(
        (o) => o._id === targetId || o.id === targetId
      );
      if (index !== -1) {
        state.orders[index] = { ...state.orders[index], ...updated };
      } else {
        // append if not found
        state.orders.push(updated);
      }
      saveOrdersToStorage(state.orders);
    },
    removeOrderLocal(state, action) {
      const targetId =
        action.payload &&
        (action.payload._id || action.payload.id || action.payload);
      state.orders = state.orders.filter(
        (o) => o._id !== targetId && o.id !== targetId
      );
      saveOrdersToStorage(state.orders);
    },
    clearOrders(state) {
      state.orders = [];
      saveOrdersToStorage(state.orders);
    },
  },
});

export const {
  fetchOrdersStart,
  fetchOrdersSuccess,
  fetchOrdersFailure,
  addOrderLocal,
  updateOrderLocal,
  removeOrderLocal,
  clearOrders,
} = orderSlice.actions;

/*
 Thunks that operate purely on local state (no network).
 These names match what Orders.jsx expects:
  - fetchOrders  (used as fetchOrdersAction in Orders.jsx)
  - updateOrderStatus
  - markOrderPaid
  - toggleOrderDelivered
*/

// fetchOrders: reads from localStorage and loads into state
export const fetchOrders = () => async (dispatch) => {
  dispatch(fetchOrdersStart());
  try {
    const orders = loadOrdersFromStorage();
    // simulate small sync delay if you want; here we dispatch immediately
    dispatch(fetchOrdersSuccess(orders));
    return orders;
  } catch {
    dispatch(fetchOrdersFailure("Failed to load orders from storage"));
    return [];
  }
};

// updateOrderStatus: expects { id, status }
export const updateOrderStatus = ({ id, status }) => async (dispatch, getState) => {
  if (!id) return null;
  const state = getState();
  const orders = state.order?.orders || [];
  const idx = orders.findIndex((o) => o._id === id || o.id === id);
  const updated = { _id: id, status };
  if (idx !== -1) {
    const merged = { ...orders[idx], ...updated };
    dispatch(updateOrderLocal(merged));
    return merged;
  } else {
    // If not found, append a minimal object
    dispatch(updateOrderLocal(updated));
    return updated;
  }
};

// markOrderPaid: expects an order object or id
export const markOrderPaid = (orderOrId) => async (dispatch, getState) => {
  const id = (orderOrId && (orderOrId._id || orderOrId.id)) || orderOrId;
  if (!id) return null;
  const state = getState();
  const orders = state.order?.orders || [];
  const idx = orders.findIndex((o) => o._id === id || o.id === id);
  const paidAt = new Date().toISOString();
  const update = { _id: id, isPaid: true, paidAt };

  if (idx !== -1) {
    const merged = { ...orders[idx], ...update };
    dispatch(updateOrderLocal(merged));
    return merged;
  } else {
    dispatch(updateOrderLocal(update));
    return update;
  }
};

// toggleOrderDelivered: expects order object or id; toggles delivered flag
export const toggleOrderDelivered = (orderOrId) => async (dispatch, getState) => {
  const id = (orderOrId && (orderOrId._id || orderOrId.id)) || orderOrId;
  if (!id) return null;
  const state = getState();
  const orders = state.order?.orders || [];
  const idx = orders.findIndex((o) => o._id === id || o.id === id);

  if (idx !== -1) {
    const current = orders[idx];
    const isDelivered = !!(current.isDelivered || current.deliveredAt);
    const update = isDelivered
      ? { _id: id, isDelivered: false, deliveredAt: null }
      : { _id: id, isDelivered: true, deliveredAt: new Date().toISOString() };
    const merged = { ...current, ...update };
    dispatch(updateOrderLocal(merged));
    return merged;
  } else {
    // if not found, create as delivered
    const newObj = { _id: id, isDelivered: true, deliveredAt: new Date().toISOString() };
    dispatch(updateOrderLocal(newObj));
    return newObj;
  }
};

// Selectors (names match Orders.jsx imports)
export const selectOrders = (state) => state.order.orders;
export const selectOrdersLoading = (state) => state.order.loading;
export const selectOrdersError = (state) => state.order.error;

export default orderSlice.reducer;
