import React, { useState, useEffect } from "react";
import axios from "axios";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    isActive: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("https://navdana-backend-2.onrender.com/api/v1/category");
      let cats = res.data?.data || res.data || [];
      if (!Array.isArray(cats)) {
        if (Array.isArray(res.data?.categories)) {
          cats = res.data.categories;
        } else {
          cats = [];
        }
      }
      setCategories(cats);
    } catch (error) {
      setFormError(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch categories"
      );
      setCategories([]);
      console.error("Error fetching categories:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (name === "image" && type === "file") {
      setImageFile(files[0]);
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");
    setLoading(true);

    const token = localStorage.getItem("token"); // Get token

    try {
      let dataToSend;
      let config = {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      };

      if (imageFile) {
        dataToSend = new FormData();
        dataToSend.append("name", formData.name);
        dataToSend.append("slug", formData.slug);
        dataToSend.append("description", formData.description);
        dataToSend.append("isActive", formData.isActive);
        dataToSend.append("image", imageFile);
        config.headers["Content-Type"] = "multipart/form-data";
      } else {
        dataToSend = { ...formData };
      }

      if (editingId) {
        // PUT request
        await axios.put(
          `https://navdana-backend-2.onrender.com/api/v1/category/${editingId}`,
          dataToSend,
          config
        );
        setSuccessMsg("Category updated successfully!");
      } else {
        // POST request
        await axios.post(
          "https://navdana-backend-2.onrender.com/api/v1/category",
          dataToSend,
          config
        );
        setSuccessMsg("Category added successfully!");
      }

      setFormData({ name: "", slug: "", description: "", image: "", isActive: true });
      setImageFile(null);
      setEditingId(null);
      fetchCategories();
    } catch (error) {
      setFormError(
        error?.response?.data?.message ||
        error?.message ||
        "Error saving category"
      );
      console.error("Error saving category:", error);
    }

    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      setFormError("");
      setSuccessMsg("");
      setLoading(true);

      const token = localStorage.getItem("token");

      try {
        await axios.delete(
          `https://navdana-backend-2.onrender.com/api/v1/category/${id}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );
        setSuccessMsg("Category deleted successfully!");
        fetchCategories();
      } catch (error) {
        setFormError(
          error?.response?.data?.message ||
          error?.message ||
          "Error deleting category"
        );
        console.error("Error deleting category:", error);
      }

      setLoading(false);
    }
  };

  const handleEdit = (cat) => {
    setFormData({
      name: cat.name || "",
      slug: cat.slug || "",
      description: cat.description || "",
      image: cat.image || "",
      isActive: cat.isActive !== undefined ? cat.isActive : true,
    });
    setImageFile(null);
    setEditingId(cat._id);
    setFormError("");
    setSuccessMsg("");
  };

  const handleCancelEdit = () => {
    setFormData({ name: "", slug: "", description: "", image: "", isActive: true });
    setImageFile(null);
    setEditingId(null);
    setFormError("");
    setSuccessMsg("");
  };

  const safeCategories = Array.isArray(categories) ? categories : [];

  return (
    <div className="p-0 m-0 w-full min-h-screen bg-gray-50">
      <div className="w-full px-2 sm:px-4 md:px-8 py-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-800 text-center tracking-tight w-full">
          Manage Categories
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
          encType="multipart/form-data"
        >
          <div className="flex flex-col gap-1 w-full">
            <label className="font-medium text-gray-700 mb-1 text-sm sm:text-base" htmlFor="cat-name">Category Name</label>
            <input
              id="cat-name"
              type="text"
              name="name"
              placeholder="Category Name"
              value={formData.name}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 w-full text-sm sm:text-base"
              required
            />
          </div>
          <div className="flex flex-col gap-1 w-full">
            <label className="font-medium text-gray-700 mb-1 text-sm sm:text-base" htmlFor="cat-slug">Slug</label>
            <input
              id="cat-slug"
              type="text"
              name="slug"
              placeholder="Slug"
              value={formData.slug}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 w-full text-sm sm:text-base"
              required
            />
          </div>
          <div className="flex flex-col gap-1 w-full">
            <label className="font-medium text-gray-700 mb-1 text-sm sm:text-base" htmlFor="cat-image">Image</label>
            <input
              id="cat-image"
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded file:mr-2 sm:file:mr-4 file:py-2 file:px-2 sm:file:px-4 file:rounded file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 w-full"
            />
          </div>
          <div className="flex flex-col gap-1 md:col-span-2 w-full">
            <label className="font-medium text-gray-700 mb-1 text-sm sm:text-base" htmlFor="cat-desc">Description</label>
            <textarea
              id="cat-desc"
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[60px] w-full text-sm sm:text-base"
            />
          </div>
          <div className="flex items-center gap-2 w-full">
            <input
              type="checkbox"
              name="isActive"
              id="cat-active"
              checked={formData.isActive}
              onChange={handleChange}
              className="accent-blue-600 h-4 w-4"
            />
            <label htmlFor="cat-active" className="text-gray-700 text-sm sm:text-base">Active</label>
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
              {editingId
                ? loading
                  ? "Updating..."
                  : "Update Category"
                : loading
                ? "Adding..."
                : "Add Category"}
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

        {/* Table/List */}
        <div className="w-full">
          {/* Mobile List */}
          <div className="block md:hidden">
            {safeCategories.length === 0 && (
              <div className="text-center p-6 text-gray-500 text-sm">
                No categories found
              </div>
            )}
            <div className="flex flex-col gap-4">
              {safeCategories.map((cat) => (
                <div
                  key={cat._id}
                  className="bg-white rounded-lg shadow border p-4 flex flex-col gap-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="h-12 w-20 object-contain border rounded shadow"
                        />
                      ) : (
                        <span className="text-gray-400 block w-20 h-12 flex items-center justify-center bg-gray-100 rounded">—</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-base">{cat.name}</div>
                      <div className="text-xs text-gray-500">Slug: {cat.slug}</div>
                      <div className="text-xs text-gray-500 truncate">Desc: {cat.description}</div>
                      <div className="mt-1">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            cat.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {cat.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded font-medium shadow transition-colors duration-150 disabled:opacity-60 text-xs"
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded font-medium shadow transition-colors duration-150 disabled:opacity-60 text-xs"
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
          <div className="hidden md:block overflow-x-auto w-full">
            <table className="w-full border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white text-sm">
              <thead>
                <tr className="bg-blue-50 text-blue-900">
                  <th className="border-b px-4 py-3 text-left font-semibold">Name</th>
                  <th className="border-b px-4 py-3 text-left font-semibold">Slug</th>
                  <th className="border-b px-4 py-3 text-left font-semibold">Description</th>
                  <th className="border-b px-4 py-3 text-left font-semibold">Image</th>
                  <th className="border-b px-4 py-3 text-left font-semibold">Active</th>
                  <th className="border-b px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {safeCategories.map((cat, idx) => (
                  <tr
                    key={cat._id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="border-b px-4 py-2">{cat.name}</td>
                    <td className="border-b px-4 py-2">{cat.slug}</td>
                    <td className="border-b px-4 py-2 max-w-xs truncate">{cat.description}</td>
                    <td className="border-b px-4 py-2">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="h-12 w-20 object-contain border rounded shadow"
                        />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="border-b px-4 py-2">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          cat.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {cat.isActive ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="border-b px-4 py-2 space-x-2">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded font-medium shadow transition-colors duration-150 disabled:opacity-60"
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded font-medium shadow transition-colors duration-150 disabled:opacity-60"
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {safeCategories.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center p-6 text-gray-500">
                      No categories found
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

export default Category;
