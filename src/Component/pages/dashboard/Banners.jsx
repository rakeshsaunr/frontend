import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://navdana-backend-2.onrender.com/api/v1/banner";

// Helper to get token from localStorage (or wherever you store it)
const getToken = () => {
  return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
};

const defaultForm = {
  title: "",
  url: null,
  isActive: true,
};

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        withCredentials: true,
      });
      setBanners(res.data?.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch banners"
      );
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setForm((prev) => ({
      ...prev,
      url: file,
    }));
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const resetForm = () => {
    setForm(defaultForm);
    setPreview(null);
    setError("");
    setSuccessMsg("");
    setShowForm(false);
  };

  // Add Banner (POST) - token is included in headers
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!form.title || !form.url) {
      setError("Title and image are required.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("isActive", form.isActive);
    formData.append("url", form.url);

    try {
      await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${getToken()}`,
        },
        withCredentials: true,
      });
      setSuccessMsg("Banner added successfully!");
      resetForm();
      fetchBanners();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (err.response?.data?.error === "Token missing"
            ? "Token missing. Please login again."
            : "Failed to upload banner. Title must be unique.")
      );
    }
    setLoading(false);
  };

  // Delete Banner (DELETE) - token is included in headers
  const handleDelete = async (bannerId) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      await axios.delete(`${API_URL}/${bannerId}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        withCredentials: true,
      });
      setSuccessMsg("Banner deleted successfully!");
      fetchBanners();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (err.response?.data?.error === "Token missing"
            ? "Token missing. Please login again."
            : "Failed to delete banner.")
      );
    }
    setLoading(false);
  };

  // Update Banner (PUT) - token is included in headers
  // Example: Toggle isActive status
  const handleToggleActive = async (banner) => {
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      await axios.put(
        `${API_URL}/${banner._id}`,
        { isActive: !banner.isActive },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      setSuccessMsg("Banner status updated!");
      fetchBanners();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (err.response?.data?.error === "Token missing"
            ? "Token missing. Please login again."
            : "Failed to update banner.")
      );
    }
    setLoading(false);
  };

  // UI similar to Product.jsx: form in a card, table for banners, add button, etc.
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 p-0 m-0">
      <div className="w-full px-2 sm:px-4 md:px-8 py-8">
        <h2 className="text-3xl font-bold mb-8 text-blue-900 text-center tracking-tight w-full drop-shadow">
          Banners Management
        </h2>
        {showForm ? (
          <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-2xl p-8 mb-10 border border-blue-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-blue-800">Add New Banner</h3>
              <button
                type="button"
                className="bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold px-4 py-1 rounded-xl shadow-lg hover:from-orange-500 hover:to-orange-600 active:scale-95 transition-all duration-200 ease-in-out"
                onClick={resetForm}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition shadow-sm bg-blue-50/50"
                  required
                  placeholder="Banner title"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full"
                  required
                />
                {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="mt-3 h-28 object-contain rounded-xl border border-blue-100 shadow"
                  />
                )}
              </div>
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleInputChange}
                  id="isActive"
                  className="mr-3 accent-blue-600 w-5 h-5 rounded focus:ring-2 focus:ring-blue-400"
                />
                <label htmlFor="isActive" className="text-gray-700 font-semibold select-none">Active</label>
              </div>
              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}
              {successMsg && (
                <div className="text-green-600 text-sm">{successMsg}</div>
              )}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold px-6 py-2 rounded-xl shadow-lg transition-all duration-200 ease-in-out active:scale-95 flex items-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M4 12a8 8 0 018-8" strokeOpacity="0.75" strokeLinecap="round"/></svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"></path></svg>
                      Add Banner
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex justify-end mb-6">
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold px-6 py-2 rounded-xl shadow-lg transition-all duration-200 ease-in-out active:scale-95 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"></path></svg>
              Add Banner
            </button>
          </div>
        )}

        <div className="bg-gradient-to-br from-blue-50 to-pink-50 shadow-2xl rounded-2xl overflow-x-auto border border-blue-100 p-4 mt-8">
          <table className="w-full border-separate border-spacing-y-2 text-[15px]">
            <thead>
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-blue-900 bg-blue-100 rounded-tl-xl">Image</th>
                <th className="px-5 py-3 text-left font-semibold text-blue-900 bg-blue-100">Title</th>
                <th className="px-5 py-3 text-left font-semibold text-blue-900 bg-blue-100">Active</th>
                <th className="px-5 py-3 text-left font-semibold text-blue-900 bg-blue-100 rounded-tr-xl">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center text-gray-500 py-8 bg-white rounded-b-xl">
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-blue-400" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Loading banners...
                    </span>
                  </td>
                </tr>
              ) : banners.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center text-gray-500 py-8 bg-white rounded-b-xl">
                    No banners found.
                  </td>
                </tr>
              ) : (
                banners.map((banner, idx) => (
                  <tr
                    key={banner._id}
                    className={`transition-all duration-200 bg-white hover:shadow-lg hover:scale-[1.01] group ${
                      idx % 2 === 0 ? "bg-white" : "bg-blue-50"
                    }`}
                  >
                    <td className="px-5 py-3 rounded-l-xl border-y border-blue-100 group-hover:bg-blue-50 transition">
                      <img
                        src={banner.url}
                        alt={banner.title}
                        className="h-16 w-32 object-contain rounded shadow border border-blue-100"
                      />
                    </td>
                    <td className="px-5 py-3 border-y border-blue-100 group-hover:bg-blue-50 transition font-semibold text-gray-800">
                      {banner.title}
                    </td>
                    <td className="px-5 py-3 border-y border-blue-100 group-hover:bg-blue-50 transition">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold shadow ${
                          banner.isActive
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-red-100 text-red-700 border border-red-200"
                        }`}
                      >
                        {banner.isActive ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-5 py-3 rounded-r-xl border-y border-blue-100 group-hover:bg-blue-50 transition">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleToggleActive(banner)}
                          className={`bg-gradient-to-r ${
                            banner.isActive
                              ? "from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600"
                              : "from-green-400 to-green-500 hover:from-green-500 hover:to-green-600"
                          } text-white px-2 py-1 rounded-lg shadow font-semibold transition-all duration-150 active:scale-95 flex items-center justify-center`}
                          title={banner.isActive ? "Edit" : "Activate"}
                          disabled={loading}
                        >
                          {banner.isActive ? (
                            <span className="material-icons align-middle text-base mr-1 text-center"></span>
                          ) : (
                            <span className="material-icons align-middle text-base mr-1">check_circle</span>
                          )}
                          <span className="w-full text-center">{banner.isActive ? "Edit" : "Activate"}</span>
                        </button>
                        <button
                          onClick={() => handleDelete(banner._id)}
                          className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-2 py-1 rounded-lg shadow font-semibold transition-all duration-150 active:scale-95 flex items-center justify-center"
                          title="Delete"
                          disabled={loading}
                        >
                          <span className="material-icons align-middle text-base mr-1 text-center">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Banners;