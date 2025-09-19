// pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import StatsCard from "./components/StatsCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    revenue: 0,
    orders: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    // Fetch dashboard stats, chart data, and recent orders
    const fetchDashboardData = async () => {
      setLoading(true);
      setErr("");
      try {
        // Example API endpoints, replace with your actual endpoints
        const [statsRes, chartRes, ordersRes] = await Promise.all([
          axios.get("https://navdana-backend-2.onrender.com/api/v1/dashboard/stats"),
          axios.get("https://navdana-backend-2.onrender.com/api/v1/dashboard/user-growth"),
          axios.get("https://navdana-backend-2.onrender.com/api/v1/order?limit=5&sort=-createdAt"),
        ]);
        setStats({
          totalUsers: statsRes.data?.totalUsers ?? 0,
          revenue: statsRes.data?.revenue ?? 0,
          orders: statsRes.data?.orders ?? 0,
        });
        setChartData(chartRes.data?.data || []);
        setOrders(ordersRes.data?.data || []);
      } catch {
        setErr("Failed to load dashboard data.");
        setStats({ totalUsers: 0, revenue: 0, orders: 0 });
        setChartData([]);
        setOrders([]);
      }
      setLoading(false);
    };
    fetchDashboardData();
  }, []);

  // Fallback demo data if API fails
  const fallbackChartData = [
    { name: "Jan", users: 400, revenue: 2400 },
    { name: "Feb", users: 300, revenue: 2210 },
    { name: "Mar", users: 500, revenue: 2290 },
    { name: "Apr", users: 700, revenue: 2000 },
  ];

  const fallbackOrders = [
    { _id: "1001", customer: "John Doe", amount: 120, status: "Completed" },
    { _id: "1002", customer: "Jane Smith", amount: 90, status: "Pending" },
  ];

  function formatCurrency(val) {
    return (
      val?.toLocaleString("en-IN", { style: "currency", currency: "INR" }) ||
      "₹0"
    );
  }

  return (
    <div className="space-y-6 animate-fadein">
      <style jsx="true">{`
        @keyframes fadein {
          from { opacity: 0; transform: translateY(20px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .animate-fadein {
          animation: fadein 0.7s cubic-bezier(0.4,0,0.2,1);
        }
        .animated-card {
          transition: box-shadow 0.3s, transform 0.3s;
        }
        .animated-card:hover {
          box-shadow: 0 4px 16px rgba(236,72,153,0.15);
          transform: translateY(-2px) scale(1.04);
        }
        .animated-table-row {
          transition: background 0.2s, transform 0.2s;
        }
        .animated-table-row:hover {
          background: #fce7f3;
          transform: scale(1.01);
        }
        @media (max-width: 640px) {
          .dashboard-stats-grid {
            grid-template-columns: 1fr !important;
          }
          .dashboard-table th, .dashboard-table td {
            font-size: 0.95rem;
            padding: 0.5rem !important;
          }
        }
      `}</style>
      {err && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded animate-fadein">
          {err}
        </div>
      )}

      {/* Stats */}
      <div className="grid dashboard-stats-grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="animated-card">
          <StatsCard
            title="Total Users"
            value={stats.totalUsers?.toLocaleString() || "0"}
          />
        </div>
        <div className="animated-card">
          <StatsCard title="Revenue" value={formatCurrency(stats.revenue)} />
        </div>
        <div className="animated-card">
          <StatsCard
            title="Orders"
            value={stats.orders?.toLocaleString() || "0"}
          />
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md animated-card">
        <h3 className="mb-4 text-lg font-semibold">User Growth</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData.length ? chartData : fallbackChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#ec4899"
              strokeWidth={2}
              dot={{ r: 4, stroke: "#ec4899", strokeWidth: 2, fill: "#fff" }}
              activeDot={{ r: 6 }}
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md animated-card overflow-x-auto">
        <h3 className="mb-4 text-lg font-semibold">Recent Orders</h3>
        <table className="w-full border-collapse dashboard-table min-w-[350px]">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">Order ID</th>
              <th className="p-2">Customer</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {(orders.length ? orders : fallbackOrders).map((order) => (
              <tr
                className="border-t animated-table-row"
                key={order._id}
              >
                <td className="p-2">#{order._id}</td>
                <td className="p-2">{order.customer}</td>
                <td className="p-2">{formatCurrency(order.amount)}</td>
                <td
                  className={`p-2 font-semibold ${
                    order.status === "Completed"
                      ? "text-green-600"
                      : order.status === "Pending"
                      ? "text-yellow-600"
                      : ""
                  }`}
                >
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs ${
                      order.status === "Completed"
                        ? "bg-green-100"
                        : order.status === "Pending"
                        ? "bg-yellow-100"
                        : "bg-gray-100"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
            {orders.length === 0 && !loading && (
              <tr>
                <td className="p-2 text-center" colSpan={4}>
                  No recent orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
