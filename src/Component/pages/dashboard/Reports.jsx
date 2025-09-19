import React, { useState } from "react";

// Dummy data for demonstration
const salesData = [
  { id: 1, date: "2024-06-01", total: 1200, orders: 15 },
  { id: 2, date: "2024-06-02", total: 950, orders: 10 },
  { id: 3, date: "2024-06-03", total: 1800, orders: 20 },
];

const userData = [
  { id: 1, name: "Amit", joined: "2024-05-10", orders: 5 },
  { id: 2, name: "Priya", joined: "2024-05-12", orders: 2 },
  { id: 3, name: "Rahul", joined: "2024-05-15", orders: 7 },
];

const inventoryData = [
  { id: 1, product: "T-shirt", stock: 120 },
  { id: 2, product: "Jeans", stock: 80 },
  { id: 3, product: "Shoes", stock: 45 },
];

const orderData = [
  { id: 101, user: "Amit", date: "2024-06-01", amount: 500 },
  { id: 102, user: "Priya", date: "2024-06-02", amount: 300 },
  { id: 103, user: "Rahul", date: "2024-06-03", amount: 700 },
];

const reportTabs = [
  { key: "sales", label: "Sales Report" },
  { key: "user", label: "User Report" },
  { key: "inventory", label: "Inventory Report" },
  { key: "order", label: "Order Report" },
];

function downloadCSV(data, filename) {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const csvRows = [
    keys.join(","),
    ...data.map(row => keys.map(k => `"${row[k]}"`).join(",")),
  ];
  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const Reports = () => {
  const [activeTab, setActiveTab] = useState("sales");

  const renderTable = () => {
    switch (activeTab) {
      case "sales":
        return (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full border mt-4 bg-white">
                <thead>
                  <tr className="bg-blue-100">
                    <th className="py-2 px-4 border">Date</th>
                    <th className="py-2 px-4 border">Total Sales (₹)</th>
                    <th className="py-2 px-4 border">Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.map((row) => (
                    <tr key={row.id} className="text-center">
                      <td className="py-2 px-4 border">{row.date}</td>
                      <td className="py-2 px-4 border">{row.total}</td>
                      <td className="py-2 px-4 border">{row.orders}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => downloadCSV(salesData, "sales_report.csv")}
            >
              Download Sales Report
            </button>
          </div>
        );
      case "user":
        return (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full border mt-4 bg-white">
                <thead>
                  <tr className="bg-green-100">
                    <th className="py-2 px-4 border">Name</th>
                    <th className="py-2 px-4 border">Joined</th>
                    <th className="py-2 px-4 border">Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {userData.map((row) => (
                    <tr key={row.id} className="text-center">
                      <td className="py-2 px-4 border">{row.name}</td>
                      <td className="py-2 px-4 border">{row.joined}</td>
                      <td className="py-2 px-4 border">{row.orders}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={() => downloadCSV(userData, "user_report.csv")}
            >
              Download User Report
            </button>
          </div>
        );
      case "inventory":
        return (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full border mt-4 bg-white">
                <thead>
                  <tr className="bg-yellow-100">
                    <th className="py-2 px-4 border">Product</th>
                    <th className="py-2 px-4 border">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryData.map((row) => (
                    <tr key={row.id} className="text-center">
                      <td className="py-2 px-4 border">{row.product}</td>
                      <td className="py-2 px-4 border">{row.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
              onClick={() => downloadCSV(inventoryData, "inventory_report.csv")}
            >
              Download Inventory Report
            </button>
          </div>
        );
      case "order":
        return (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full border mt-4 bg-white">
                <thead>
                  <tr className="bg-red-100">
                    <th className="py-2 px-4 border">Order ID</th>
                    <th className="py-2 px-4 border">User</th>
                    <th className="py-2 px-4 border">Date</th>
                    <th className="py-2 px-4 border">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {orderData.map((row) => (
                    <tr key={row.id} className="text-center">
                      <td className="py-2 px-4 border">{row.id}</td>
                      <td className="py-2 px-4 border">{row.user}</td>
                      <td className="py-2 px-4 border">{row.date}</td>
                      <td className="py-2 px-4 border">{row.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              onClick={() => downloadCSV(orderData, "order_report.csv")}
            >
              Download Order Report
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const handleDownloadAll = () => {
    downloadCSV(salesData, "sales_report.csv");
    downloadCSV(userData, "user_report.csv");
    downloadCSV(inventoryData, "inventory_report.csv");
    downloadCSV(orderData, "order_report.csv");
  };

  return (
    <div className="min-h-screen w-full bg-white py-10 px-0">
      <div className="w-full bg-white rounded-none shadow-none p-0 border-0">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
          Reports Dashboard
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Welcome to the complete Reports page. View, analyze, and download all your reports.
        </p>
        <div className="flex justify-center mb-6 flex-wrap">
          {reportTabs.map((tab) => (
            <button
              key={tab.key}
              className={`px-4 py-2 mx-1 rounded-t-lg font-semibold transition
                ${
                  activeTab === tab.key
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="w-full">{renderTable()}</div>
        <div className="mt-10 flex justify-center">
          <button
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            onClick={handleDownloadAll}
          >
            Download All Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;






  