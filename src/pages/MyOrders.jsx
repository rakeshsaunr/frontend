import React, { useEffect, useState } from "react";
import {
  Loader2,
  Package,
  MapPin,
  CreditCard,
  Calendar,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setOrders } from "../app/orderSlice";
import axios from "axios";

const statusStyles = {
  completed: "bg-green-100 text-green-700 ring-1 ring-inset ring-green-200",
  processing: "bg-yellow-100 text-yellow-700 ring-1 ring-inset ring-yellow-200",
  cancelled: "bg-red-100 text-red-700 ring-1 ring-inset ring-red-200",
  pending: "bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200",
};

const MyOrders = () => {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.order.orders);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          "https://navdana-backend-2.onrender.com/api/v1/order/user-orders",
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        dispatch(setOrders(res.data.orders || []));
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token, dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-10 text-center tracking-tight text-gray-900">
          <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            My Orders
          </span>
        </h1>

        {(!orders || orders.length === 0) ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Package className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg font-medium">
              You haven’t placed any orders yet.
            </p>
            <p className="text-sm text-gray-400 mt-2">Start shopping to see your orders here!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const isExpanded = expandedOrder === order._id;
              return (
                <div
                  key={order._id}
                  className="rounded-xl shadow-lg border border-gray-200 bg-white overflow-hidden transform hover:scale-[1.005] hover:shadow-xl transition-all duration-300 ease-in-out"
                >
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="bg-indigo-100 p-2 rounded-full">
                        <Package className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-lg text-gray-900">
                          Order <span className="text-indigo-600">#{order._id.slice(-6)}</span>
                        </h2>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">
                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 md:mt-0 flex items-center gap-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusStyles[order.status]}`}
                      >
                        {order.status === "completed" && <CheckCircle className="w-4 h-4" />}
                        {order.status === "processing" && <Clock className="w-4 h-4" />}
                        {order.status === "cancelled" && <XCircle className="w-4 h-4" />}
                        {order.status === "pending" && <Clock className="w-4 h-4" />}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <button
                        onClick={() =>
                          setExpandedOrder(isExpanded ? null : order._id)
                        }
                        className="text-gray-500 hover:text-indigo-600 transition-colors p-1"
                      >
                        {isExpanded ? <ChevronUp /> : <ChevronDown />}
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Details */}
                  {isExpanded && (
                    <div className="px-6 py-5 space-y-6 animate-slideIn">
                      {/* Grid Sections */}
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                        {/* Shipping */}
                        <div className="p-5 rounded-lg bg-gray-50/70 border border-gray-200">
                          <h3 className="font-semibold flex items-center gap-2 mb-3 text-gray-800">
                            <MapPin className="w-4 h-4 text-indigo-500" /> Shipping Address
                          </h3>
                          <div className="space-y-1 text-gray-600">
                            <p className="font-medium">{order.shippingAddress?.fullName}</p>
                            <p>{order.shippingAddress?.address}</p>
                            <p>
                              {order.shippingAddress?.city},{" "}
                              {order.shippingAddress?.postalCode}
                            </p>
                            <p>{order.shippingAddress?.country}</p>
                            {order.shippingAddress?.phone && (
                              <p className="text-gray-500 mt-2">
                                📞 {order.shippingAddress.phone}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Payment */}
                        <div className="p-5 rounded-lg bg-gray-50/70 border border-gray-200">
                          <h3 className="font-semibold flex items-center gap-2 mb-3 text-gray-800">
                            <CreditCard className="w-4 h-4 text-indigo-500" /> Payment Details
                          </h3>
                          <div className="space-y-1 text-gray-600">
                            <p>
                              <span className="font-medium">Method:</span>{" "}
                              {order.paymentMethod}
                            </p>
                            <p>
                              <span className="font-medium">Status:</span>{" "}
                              <span
                                className={`font-semibold ${
                                  order.isPaid ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                {order.isPaid ? "Paid" : "Not Paid"}
                              </span>
                            </p>
                            <div className="pt-2 mt-2 border-t border-gray-200">
                              <p className="font-bold text-gray-800">
                                Total: ₹{order.prices?.totalPrice || "0.00"}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Price Breakdown */}
                        <div className="p-5 rounded-lg bg-gray-50/70 border border-gray-200">
                          <h3 className="font-semibold flex items-center gap-2 mb-3 text-gray-800">
                            <FileText className="w-4 h-4 text-indigo-500" /> Price Breakdown
                          </h3>
                          <div className="space-y-1 text-gray-600">
                            <div className="flex justify-between">
                              <span>Subtotal:</span>
                              <span>₹{order.prices?.itemsPrice || "0.00"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Shipping:</span>
                              <span>₹{order.prices?.shippingPrice || "0.00"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Tax:</span>
                              <span>₹{order.prices?.taxPrice || "0.00"}</span>
                            </div>
                            <div className="flex justify-between font-bold pt-2 mt-2 border-t border-gray-200 text-gray-800">
                              <span>Order Total:</span>
                              <span>₹{order.prices?.totalPrice || "0.00"}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Items */}
                      <div>
                        <h3 className="font-semibold text-lg mb-3 text-gray-800">
                          Order Items
                        </h3>
                        <div className="divide-y divide-gray-200 rounded-lg border border-gray-200">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                                  {/* Replace with actual product image if available */}
                                  <Package className="w-8 h-8 text-gray-400" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{item.name}</p>
                                  <p className="text-gray-500 text-sm mt-1">
                                    Qty: {item.quantity} | Size: {item.size || "-"} | Color:{" "}
                                    {item.color || "-"}
                                  </p>
                                </div>
                              </div>
                              <p className="font-semibold text-gray-800 mt-2 sm:mt-0">
                                ₹{item.price * item.quantity}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
