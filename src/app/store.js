import { configureStore } from '@reduxjs/toolkit'
import productReducer from "./productSlice"
import cartReducer from "./cartSlice"
import orderReducer from "./orderSlice"
import authReducer from "./authSlice"

export const store = configureStore({
  reducer: {
    product: productReducer,
    cart: cartReducer,
    order: orderReducer,
    auth: authReducer,
  }
})