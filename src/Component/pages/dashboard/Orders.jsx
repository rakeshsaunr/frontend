// src/pages/Orders.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";

const API_URL = "https://navdana-backend-2.onrender.com/api/v1/order";

const currency = (num) =>
  num == null ? "—" : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(num);

const formatDateTime = (iso) => (iso ? new Date(iso).toLocaleString() : "—");

const Badge = ({ children, tone = "neutral" }) => {
  const base = "inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold";
  const toneClass =
    tone === "success"
      ? "bg-green-100 text-green-800"
      : tone === "warning"
      ? "bg-yellow-100 text-yellow-800"
      : tone === "danger"
      ? "bg-red-100 text-red-800"
      : "bg-gray-100 text-gray-700";
  return <span className={`${base} ${toneClass}`}>{children}</span>;
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      // assume API returns array at res.data.data or res.data
      const data = res.data?.orders ?? res.data ?? [];
      console.log("Order Data is:",data)
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const isPaid = (order) =>
    !!(
      order?.isPaid ||
      order?.paymentInfo?.status === "paid" ||
      order?.paymentInfo?.id ||
      order?.paidAt
    );

  const isDelivered = (order) => !!(order?.isDelivered || order?.deliveredAt);

  const updateOrderLocal = (id, patch) =>
    setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, ...patch } : o)));

  const updateSelectedIfMatches = (id, patch) =>
    setSelectedOrder((cur) => (cur && cur._id === id ? { ...cur, ...patch } : cur));

 const handleStatusChange = async (id, status) => {
  try {
    // optimistic update in UI
    const token = localStorage.getItem('token')
    updateOrderLocal(id, { status });
    updateSelectedIfMatches(id, { status });

    // call your backend PATCH route
    await axios.patch(`${API_URL}/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });

    // re-fetch to be safe
    fetchOrders();
  } catch (error) {
    console.error("Error updating status:", error);
    fetchOrders();
  }
};


  const handleMarkPaid = async (order) => {
    if (!order) return;
    const id = order._id;
    try {
      // optimistic local update
      const now = new Date().toISOString();
      const patch = { isPaid: true, paidAt: now, paymentInfo: { ...(order.paymentInfo || {}), status: "paid", update_time: now } };
      updateOrderLocal(id, patch);
      updateSelectedIfMatches(id, patch);

      // backend update - many APIs accept partial updates via PUT; adjust if your backend has a different endpoint
      await axios.put(`${API_URL}/${id}`, {
        isPaid: true,
        paidAt: now,
        paymentInfo: { ...(order.paymentInfo || {}), status: "paid", update_time: now },
      });

      // refetch to be sure
      fetchOrders();
    } catch (error) {
      console.error("Error marking paid:", error);
      // revert / re-fetch
      fetchOrders();
    }
  };

  const handleToggleDelivered = async (order) => {
    if (!order) return;
    const id = order._id;
    const currently = isDelivered(order);
    try {
      const now = currently ? null : new Date().toISOString();
      const patch = { isDelivered: !currently, deliveredAt: now, status: !currently ? "completed" : order.status };
      updateOrderLocal(id, patch);
      updateSelectedIfMatches(id, patch);

      await axios.put(`${API_URL}/${id}`, {
        isDelivered: !currently,
        deliveredAt: now,
        status: !currently ? "completed" : order.status,
      });

      fetchOrders();
    } catch (error) {
      console.error("Error toggling delivered:", error);
      fetchOrders();
    }
  };

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (!q) return true;
      const matches =
        o._id?.toLowerCase().includes(q) ||
        o.shippingAddress?.fullName?.toLowerCase().includes(q) ||
        o.user?.email?.toLowerCase().includes(q) ||
        (o.items || []).some((it) => it.name?.toLowerCase().includes(q));
      return matches;
    });
  }, [orders, query, statusFilter]);

  return (
    <div className="p-4 w-full min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>

          <div className="flex gap-2 items-center">
            <input
              aria-label="Search orders"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email, order id or item..."
              className="px-3 py-2 border rounded w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-blue-300"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              onClick={() => fetchOrders()}
              className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </header>

        {/* Table (desktop) */}
        <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 font-semibold text-xs text-gray-700">Order</th>
                <th className="px-4 py-3 font-semibold text-xs text-gray-700">Customer</th>
                <th className="px-4 py-3 font-semibold text-xs text-gray-700">Payment</th>
                <th className="px-4 py-3 font-semibold text-xs text-gray-700">Items</th>
                <th className="px-4 py-3 font-semibold text-xs text-gray-700">Total</th>
                <th className="px-4 py-3 font-semibold text-xs text-gray-700">Placed</th>
                <th className="px-4 py-3 font-semibold text-xs text-gray-700">Status / Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              )}
              {!loading && filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}

              {filteredOrders.map((order) => {
                const paid = isPaid(order);
                const delivered = isDelivered(order);
                return (
                  <tr key={order._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 align-top">
                      <div className="text-xs break-all font-medium">{order._id}</div>
                      <div className="text-2xs text-gray-400">{order.user?._id ?? ""}</div>
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="font-medium">{order.shippingAddress?.fullName ?? "—"}</div>
                      <div className="text-xs text-gray-500">{order.user?.email ?? "—"}</div>
                      <div className="text-xs text-gray-500">{order.shippingAddress?.phone ?? ""}</div>
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col gap-1">
                        <div className="text-xs">{order.paymentMethod ?? "—"}</div>
                        <div>
                          {paid ? <Badge tone="success">Paid ✅</Badge> : <Badge tone="danger">Unpaid ❌</Badge>}
                        </div>
                        {order.paymentInfo?.id && (
                          <div className="text-xs text-gray-600">PayID: {order.paymentInfo.id}</div>
                        )}
                        {order.paymentInfo?.orderId && (
                          <div className="text-xs text-gray-600">OrderRef: {order.paymentInfo.orderId}</div>
                        )}
                        {order.paymentInfo?.update_time && (
                          <div className="text-xs text-gray-600">
                            Updated: {formatDateTime(order.paymentInfo.update_time)}
                          </div>
                        )}
                        {order.paidAt && <div className="text-xs text-gray-600">Paid At: {formatDateTime(order.paidAt)}</div>}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="max-w-xs">
                        {(order.items || []).slice(0, 3).map((it, idx) => (
                          <div key={idx} className="text-xs">
                            {it.name} x{it.quantity} • {it.size ?? "-"} / {it.color ?? "-"}{" "}
                            <span className="text-gray-500">({currency(it.price)})</span>
                          </div>
                        ))}
                        {order.items?.length > 3 && (
                          <div className="text-xs text-gray-500">+{order.items.length - 3} more</div>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-top font-semibold">{currency(order.prices?.totalPrice)}</td>

                    <td className="px-4 py-3 align-top text-xs text-gray-600">{formatDateTime(order.createdAt)}</td>

                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <select
                            aria-label="Change order status"
                            value={order.status}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className="px-2 py-1 border rounded text-xs focus:ring-2 focus:ring-blue-300"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
                          >
                            View Details
                          </button>

                          <button
                            onClick={() => handleMarkPaid(order)}
                            disabled={paid}
                            className={`text-xs px-2 py-1 rounded ${
                              paid ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-green-600 text-white hover:bg-green-700"
                            }`}
                          >
                            {paid ? "Paid" : "Mark as Paid"}
                          </button>

                          <button
                            onClick={() => handleToggleDelivered(order)}
                            className={`text-xs px-2 py-1 rounded ${
                              delivered ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {delivered ? `Delivered (${formatDateTime(order.deliveredAt)})` : "Mark Delivered"}
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile list */}
        <div className="md:hidden mt-4 flex flex-col gap-3">
          {filteredOrders.map((order) => {
            const paid = isPaid(order);
            const delivered = isDelivered(order);
            return (
              <div key={order._id} className="bg-white p-3 rounded-lg shadow">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="font-medium truncate">{order.shippingAddress?.fullName ?? "—"}</div>
                    <div className="text-xs text-gray-500 truncate">{order.user?.email ?? "—"}</div>
                    <div className="text-xs text-gray-500 mt-1">{currency(order.prices?.totalPrice)}</div>
                    <div className="text-xs text-gray-500 mt-1">Placed: {formatDateTime(order.createdAt)}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {paid ? <Badge tone="success">Paid</Badge> : <Badge tone="danger">Unpaid</Badge>}
                    <div className="text-xs mt-1">
                      <button onClick={() => setSelectedOrder(order)} className="underline text-blue-600 text-xs">
                        Details
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleMarkPaid(order)}
                    disabled={paid}
                    className={`flex-1 text-xs px-2 py-1 rounded ${
                      paid ? "bg-gray-100 text-gray-500" : "bg-green-600 text-white"
                    }`}
                  >
                    {paid ? "Paid" : "Mark Paid"}
                  </button>
                  <button
                    onClick={() => handleToggleDelivered(order)}
                    className={`flex-1 text-xs px-2 py-1 rounded ${
                      delivered ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {delivered ? "Delivered" : "Mark Delivered"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Details modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl overflow-auto max-h-[90vh] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Order Details</h2>
                  <div className="text-xs text-gray-500 mt-1">ID: {selectedOrder._id}</div>
                </div>
                <div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-600 hover:text-gray-800"
                    aria-label="Close details"
                  >
                    ✖
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Left column: customer & shipping */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium">Customer</h3>
                    <div className="text-sm">{selectedOrder.shippingAddress?.fullName}</div>
                    <div className="text-xs text-gray-500">{selectedOrder.user?.email}</div>
                    <div className="text-xs text-gray-500">{selectedOrder.shippingAddress?.phone}</div>
                  </div>

                  <div>
                    <h3 className="font-medium">Shipping Address</h3>
                    <div className="text-sm">{selectedOrder.shippingAddress?.address}</div>
                    <div className="text-xs text-gray-500">
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode},{" "}
                      {selectedOrder.shippingAddress?.country}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium">Payment</h3>
                    <div className="text-sm">{selectedOrder.paymentMethod}</div>
                    <div className="mt-1">
                      {isPaid(selectedOrder) ? <Badge tone="success">Paid</Badge> : <Badge tone="danger">Unpaid</Badge>}
                    </div>
                    {selectedOrder.paymentInfo && (
                      <div className="text-xs text-gray-600 mt-2">
                        <div>Payment ID: {selectedOrder.paymentInfo?.id ?? "—"}</div>
                        <div>OrderRef: {selectedOrder.paymentInfo?.orderId ?? "—"}</div>
                        <div>Status: {selectedOrder.paymentInfo?.status ?? "—"}</div>
                        <div>Updated: {formatDateTime(selectedOrder.paymentInfo?.update_time)}</div>
                        <div>Email: {selectedOrder.paymentInfo?.email_address ?? "—"}</div>
                      </div>
                    )}
                    {selectedOrder.paidAt && <div className="text-xs text-gray-600 mt-1">Paid At: {formatDateTime(selectedOrder.paidAt)}</div>}
                  </div>
                </div>

                {/* Right column: items & summary */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium">Items ({selectedOrder.items?.length ?? 0})</h3>
                    <ul className="mt-2 space-y-2">
                      {selectedOrder.items?.map((it, idx) => (
                        <li key={idx} className="border rounded p-2 text-sm flex justify-between items-center">
                          <div>
                            <div className="font-medium">{it.name}</div>
                            <div className="text-xs text-gray-500">
                              {it.size ?? "-"} / {it.color ?? "-"} • SKU: {it.sku ?? "-"}
                            </div>
                            <div className="text-xs text-gray-500">Qty: {it.quantity}</div>
                          </div>
                          <div className="font-semibold">{currency(it.price)}</div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium">Summary</h3>
                    <div className="text-sm mt-2">
                      <div className="flex justify-between">
                        <div>Items</div>
                        <div>{currency(selectedOrder.prices?.itemsPrice)}</div>
                      </div>
                      <div className="flex justify-between">
                        <div>Tax</div>
                        <div>{currency(selectedOrder.prices?.taxPrice)}</div>
                      </div>
                      <div className="flex justify-between">
                        <div>Shipping</div>
                        <div>{currency(selectedOrder.prices?.shippingPrice)}</div>
                      </div>
                      <div className="flex justify-between font-semibold mt-2">
                        <div>Total</div>
                        <div>{currency(selectedOrder.prices?.totalPrice)}</div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">Placed: {formatDateTime(selectedOrder.createdAt)}</div>
                      <div className="text-xs text-gray-500">Delivered: {formatDateTime(selectedOrder.deliveredAt)}</div>
                    </div>
                  </div>

                  {/* Admin actions */}
                  <div className="flex flex-col gap-2 mt-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMarkPaid(selectedOrder)}
                        disabled={isPaid(selectedOrder)}
                        className={`px-3 py-2 rounded text-sm ${
                          isPaid(selectedOrder) ? "bg-gray-100 text-gray-500" : "bg-green-600 text-white"
                        }`}
                      >
                        {isPaid(selectedOrder) ? "Paid" : "Mark as Paid"}
                      </button>

                      <button
                        onClick={() => handleToggleDelivered(selectedOrder)}
                        className={`px-3 py-2 rounded text-sm ${isDelivered(selectedOrder) ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700"}`}
                      >
                        {isDelivered(selectedOrder) ? `Delivered (${formatDateTime(selectedOrder.deliveredAt)})` : "Mark Delivered"}
                      </button>

                      <button
                        onClick={() => {
                          // quick status change to completed
                          handleStatusChange(selectedOrder._id, "completed");
                        }}
                        className="px-3 py-2 rounded text-sm bg-yellow-600 text-white"
                      >
                        Mark Completed
                      </button>
                    </div>

                    <div className="text-xs text-gray-500">
                      TIP: use these actions to sync payment/delivery flags—if your backend uses webhooks from Razorpay,
                      update the server side to set <code>isPaid</code> / <code>paidAt</code> when webhook confirms payment.
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button onClick={() => setSelectedOrder(null)} className="px-3 py-2 border rounded text-sm">
                  Close
                </button>
                <button
                  onClick={() => {
                    // show raw JSON in console for debugging
                    // developer friendly: you can replace with a copy-to-clipboard feature
                    // eslint-disable-next-line no-console
                    console.log(selectedOrder);
                    alert("Order JSON printed to console (developer)");
                  }}
                  className="px-3 py-2 border rounded text-sm"
                >
                  Debug JSON
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
