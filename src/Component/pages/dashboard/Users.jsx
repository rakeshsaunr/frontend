// src/pages/Users.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://navdana-backend-2.onrender.com/api/v1/users";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    DOB: "",
    phoneNumber: "",
    role: "customer",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setFormError("");
    try {
      const res = await axios.get(API_URL);
      let userList = res.data?.data || res.data?.users || res.data || [];
      if (!Array.isArray(userList) && Array.isArray(res.data?.users)) {
        userList = res.data.users;
      }
      setUsers(Array.isArray(userList) ? userList : []);
    } catch (error) {
      setFormError(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (error?.response?.status === 404
          ? "User API endpoint not found (404). Please check the API URL."
          : "Error fetching users")
      );
      setUsers([]);
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching users:", error);
      }
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      if (editingId) {
        const dataToSend = { ...formData };
        if (!dataToSend.password) delete dataToSend.password;
        await axios.put(`${API_URL}/${editingId}`, dataToSend);
        setSuccessMsg("User updated successfully!");
      } else {
        await axios.post(API_URL, formData);
        setSuccessMsg("User added successfully!");
      }
      setFormData({
        name: "",
        email: "",
        password: "",
        DOB: "",
        phoneNumber: "",
        role: "customer",
      });
      setEditingId(null);
      fetchUsers();
    } catch (error) {
      setFormError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Error saving user"
      );
      if (process.env.NODE_ENV === "development") {
        console.error("Error saving user:", error);
      }
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setFormError("");
      setSuccessMsg("");
      setLoading(true);
      try {
        await axios.delete(`${API_URL}/${id}`);
        setSuccessMsg("User deleted successfully!");
        fetchUsers();
      } catch (error) {
        setFormError(
          error?.response?.data?.message ||
            error?.response?.data?.error ||
            "Error deleting user"
        );
        if (process.env.NODE_ENV === "development") {
          console.error("Error deleting user:", error);
        }
      }
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
      DOB: user.DOB ? new Date(user.DOB).toISOString().split("T")[0] : "",
      phoneNumber: user.phoneNumber || "",
      role: user.role || "customer",
    });
    setEditingId(user._id);
    setFormError("");
    setSuccessMsg("");
  };

  const handleCancelEdit = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      DOB: "",
      phoneNumber: "",
      role: "customer",
    });
    setEditingId(null);
    setFormError("");
    setSuccessMsg("");
  };

  return (
    <div className="p-0 m-0 w-full min-h-screen bg-gray-50">
      <div className="w-full px-2 sm:px-4 md:px-8 py-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-800 text-center tracking-tight w-full">
          Manage Users
        </h2>

        {formError && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-2 sm:px-4 py-2 mb-4 rounded shadow-sm text-center w-full text-sm sm:text-base">
            {formError}
          </div>
        )}
        {successMsg && (
          <div className="bg-green-100 border border-green-300 text-green-700 px-2 sm:px-4 py-2 mb-4 rounded shadow-sm text-center w-full text-sm sm:text-base">
            {successMsg}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-3 sm:p-6 mb-8 sm:mb-10 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 border w-full"
          autoComplete="off"
        >
          <div className="flex flex-col gap-1 w-full">
            <label className="font-medium text-gray-700 mb-1 text-sm sm:text-base" htmlFor="user-name">
              Full Name
            </label>
            <input
              id="user-name"
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 w-full text-sm sm:text-base"
              required
            />
          </div>
          <div className="flex flex-col gap-1 w-full">
            <label className="font-medium text-gray-700 mb-1 text-sm sm:text-base" htmlFor="user-email">
              Email Address
            </label>
            <input
              id="user-email"
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 w-full text-sm sm:text-base"
              required
            />
          </div>
          <div className="flex flex-col gap-1 w-full">
            <label className="font-medium text-gray-700 mb-1 text-sm sm:text-base" htmlFor="user-password">
              Password
            </label>
            <input
              id="user-password"
              type="password"
              name="password"
              placeholder={editingId ? "Leave blank to keep unchanged" : "Password"}
              value={formData.password}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 w-full text-sm sm:text-base"
              required={!editingId}
              autoComplete="new-password"
            />
          </div>
          <div className="flex flex-col gap-1 w-full">
            <label className="font-medium text-gray-700 mb-1 text-sm sm:text-base" htmlFor="user-dob">
              Date of Birth
            </label>
            <input
              id="user-dob"
              type="date"
              name="DOB"
              value={formData.DOB}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 w-full text-sm sm:text-base"
              required
            />
          </div>
          <div className="flex flex-col gap-1 w-full">
            <label className="font-medium text-gray-700 mb-1 text-sm sm:text-base" htmlFor="user-phone">
              Phone Number
            </label>
            <input
              id="user-phone"
              type="text"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 w-full text-sm sm:text-base"
            />
          </div>
          <div className="flex flex-col gap-1 w-full">
            <label className="font-medium text-gray-700 mb-1 text-sm sm:text-base" htmlFor="user-role">
              Role
            </label>
            <select
              id="user-role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 w-full text-sm sm:text-base"
            >
              <option value="customer">Customer</option>
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 col-span-1 md:col-span-2 mt-2 w-full">
            <button
              type="submit"
              className={`px-4 sm:px-5 py-2 rounded font-semibold shadow transition-colors duration-150 ${
                editingId
                  ? "bg-yellow-500 hover:bg-yellow-600"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white disabled:opacity-60 w-full sm:w-auto text-sm sm:text-base`}
              disabled={loading}
            >
              {editingId ? (loading ? "Updating..." : "Update User") : loading ? "Adding..." : "Add User"}
            </button>
            {editingId && (
              <button
                type="button"
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 sm:px-5 py-2 rounded font-semibold shadow disabled:opacity-60 w-full sm:w-auto text-sm sm:text-base"
                onClick={handleCancelEdit}
                disabled={loading}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Responsive Table/List */}
        {/* Mobile List */}
        <div className="block md:hidden">
          {users.length === 0 && (
            <div className="text-center p-6 text-gray-500 text-sm">
              {loading ? "Loading..." : "No users found"}
            </div>
          )}
          <div className="flex flex-col gap-4">
            {users.map((u) => (
              <div
                key={u._id}
                className="bg-white rounded-lg shadow border p-4 flex flex-col gap-2"
              >
                <div className="flex flex-col gap-1">
                  <div className="font-semibold text-base text-gray-800">{u.name}</div>
                  <div className="text-xs text-gray-500 break-all">{u.email}</div>
                  <div className="text-xs text-gray-500">
                    DOB: {u.DOB ? new Date(u.DOB).toLocaleDateString() : "—"}
                  </div>
                  <div className="text-xs text-gray-500">
                    Phone: {u.phoneNumber || "—"}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    Role: {u.role}
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleEdit(u)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs font-semibold shadow"
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(u._id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-semibold shadow"
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block">
          <div className="overflow-x-auto rounded-lg shadow border">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border-b px-4 py-3 text-left text-xs font-semibold text-gray-700">Name</th>
                  <th className="border-b px-4 py-3 text-left text-xs font-semibold text-gray-700">Email</th>
                  <th className="border-b px-4 py-3 text-left text-xs font-semibold text-gray-700">DOB</th>
                  <th className="border-b px-4 py-3 text-left text-xs font-semibold text-gray-700">Phone</th>
                  <th className="border-b px-4 py-3 text-left text-xs font-semibold text-gray-700">Role</th>
                  <th className="border-b px-4 py-3 text-left text-xs font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50 transition">
                    <td className="border-b px-4 py-2 text-sm">{u.name}</td>
                    <td className="border-b px-4 py-2 text-sm break-all">{u.email}</td>
                    <td className="border-b px-4 py-2 text-sm">
                      {u.DOB ? new Date(u.DOB).toLocaleDateString() : "—"}
                    </td>
                    <td className="border-b px-4 py-2 text-sm">{u.phoneNumber || "—"}</td>
                    <td className="border-b px-4 py-2 text-sm capitalize">{u.role}</td>
                    <td className="border-b px-4 py-2 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(u)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs font-semibold shadow"
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(u._id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-semibold shadow"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center p-4 text-gray-500 text-sm">
                      {loading ? "Loading..." : "No users found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
