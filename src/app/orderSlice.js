import { createSlice } from "@reduxjs/toolkit";

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],   // yahi tumhara actual project orders store hoga
  },
  reducers: {
    setOrders: (state, action) => {
      state.orders = action.payload;
    },
    addOrder: (state, action) => {
      state.orders.push(action.payload);
    },
    updateOrderStatus: (state, action) => {
      const { id, status } = action.payload;
      const order = state.orders.find((o) => o._id === id);
      if (order) order.status = status;
    },
    clearOrders: (state) => {
      state.orders = [];
    },
  },
});

export const { setOrders, addOrder, updateOrderStatus, clearOrders } =
  orderSlice.actions;

export default orderSlice.reducer;
