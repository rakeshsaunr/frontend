import { useState, useEffect } from "react";
import axios from "axios";
import namer from "color-namer";

// ColorNameConverter function
const ColorNameConverter = (hex) => {
  if (!hex) return "";
  try {
    return namer(hex).basic[0].name;
  } catch {
    return "";
  }
};

const API_URL = "https://navdana-backend-2.onrender.com/api/v1/product";
const CATEGORY_API = "https://navdana-backend-2.onrender.com/api/v1/category";

// Default variant row
const defaultVariantRow = () => ({
  color: "#000000",
  colorName: "",
  sku: "",
  stock: "",
  size: "",
});

const Product = () => {
  console.log("Product Route Hit")
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    images: [{ file: null, alt: "" }],
    category: "",
    price: "",
    variants: [defaultVariantRow()],
    isActive: true,
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [imageView, setImageView] = useState({ open: false, url: "", alt: "" });
  const [showFormPage, setShowFormPage] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Fix: Always ensure product.variant is an array for display
  const normalizeVariants = (variant) => {
    if (Array.isArray(variant)) return variant;
    if (variant && typeof variant === "object") return [variant];
    return [];
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      console.log("Logs in the Product Section",res.data.data)
      // Fix: Ensure each product.variant is always an array
      const prods = (res.data?.data || []).map((prod) => ({
        ...prod,
        variant: normalizeVariants(prod.variant),
      }));
      setProducts(prods);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(CATEGORY_API);
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
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleVariantRowChange = (idx, field, value) => {
    let updated = formData.variants.map((v, i) => {
      if (i !== idx) return v;
      if (field === "color") {
        const autoName = ColorNameConverter(value);
        return { ...v, color: value, colorName: autoName };
      }
      if (field === "colorName") {
        return { ...v, colorName: value };
      }
      return { ...v, [field]: value };
    });
    setFormData({ ...formData, variants: updated });
  };

  const addVariantRow = () => {
    setFormData({ ...formData, variants: [...formData.variants, defaultVariantRow()] });
  };

  const removeVariantRow = (idx) => {
    if (formData.variants.length === 1) return;
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== idx),
    });
  };

  const handleImageChange = (index, field, value) => {
    const updatedImages = [...formData.images];
    if (field === "file") {
      updatedImages[index][field] = value.target.files[0];
    } else {
      updatedImages[index][field] = value;
    }
    setFormData({ ...formData, images: updatedImages });
  };

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, { file: null, alt: "" }] });
  };

  const removeImageField = (index) => {
    if (formData.images.length === 1) return;
    const updatedImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: updatedImages });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      images: [{ file: null, alt: "" }],
      category: "",
      price: "",
      variants: [defaultVariantRow()],
      isActive: true,
    });
    setEditingId(null);
    setFormError("");
    setSuccessMsg("");
    setShowFormPage(false);
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Product name is required";
    if (!formData.description.trim()) return "Description is required";
    if (!formData.category) return "Category is required";
    if (!formData.price || isNaN(formData.price)) return "Valid price is required";
    if (!formData.variants.length) return "At least one variant is required";
    for (let i = 0; i < formData.variants.length; i++) {
      const v = formData.variants[i];
      if (!v.colorName.trim()) return `Color name is required for variant ${i + 1}`;
      if (!v.color) return `Color is required for variant ${i + 1}`;
      if (!v.sku.trim()) return `SKU is required for variant ${i + 1}`;
      if (!v.stock || isNaN(v.stock)) return `Valid stock is required for variant ${i + 1}`;
      if (!v.size.trim()) return `Size is required for variant ${i + 1}`;
    }
    if (!editingId && (!formData.images.length || !formData.images.some(img => img.file))) {
      return "At least one product image is required";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");
    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }
    setLoading(true);
    try {
      // Ensure all variants have colorName filled using ColorNameConverter
      const variantsWithColorName = formData.variants.map((v) => ({
        ...v,
        colorName: v.colorName && v.colorName.trim() !== "" ? v.colorName : ColorNameConverter(v.color),
      }));

      let dataToSend = new FormData();
      dataToSend.append("name", formData.name);
      dataToSend.append("description", formData.description);
      dataToSend.append("category", formData.category);
      dataToSend.append("price", formData.price);
      dataToSend.append("isActive", formData.isActive ? "true" : "false");
      // Ensure 'variant' is always an array and matches backend expectations
      dataToSend.append("variant", JSON.stringify(variantsWithColorName));

      formData.images.forEach((img) => {
        if (img.file) {
          dataToSend.append("images", img.file); // new file
          dataToSend.append("alts", img.alt || "");
        } else if (img._id) {
          dataToSend.append("existingImages", img._id); // only send if still present
        }
      });
      
      
      

      // Fetch token from localStorage
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      };

      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, dataToSend, config);
        setSuccessMsg("Product updated successfully!");
      } else {
        await axios.post(API_URL, dataToSend, config);
        setSuccessMsg("Product added successfully!");
      }
      resetForm();
      fetchProducts();
    } catch (error) {
      setFormError(
        error?.response?.data?.message ||
        error?.message ||
        "Error saving product"
      );
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setLoading(true);
      try {
        // Fetch token from localStorage
        const token = localStorage.getItem("token");
        const config = {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        };
        await axios.delete(`${API_URL}/${id}`, config);
        setSuccessMsg("Product deleted successfully!");
        fetchProducts();
      } catch (error) {
        setFormError(
          error?.response?.data?.message ||
          error?.message ||
          "Error deleting product"
        );
      }
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name || "",
      description: product.description || "",
      images: product.images
      ? product.images.map((img) => ({ file: null, url: img.url, alt: img.alt || "", _id: img._id }))
      : [{ file: null, alt: "" }],
      category: product.category?._id || "",
      price: product.price || "",
      variants: normalizeVariants(product.variant).length > 0
        ? normalizeVariants(product.variant).map((v) => ({
            color: v.color || "#000000",
            colorName: v.colorName || ColorNameConverter(v.color || "#000000"),
            sku: v.sku || "",
            stock: v.stock || "",
            size: v.size || "",
          }))
        : [defaultVariantRow()],
      isActive: product.isActive ?? true,
    });
    setEditingId(product._id);
    setFormError("");
    setSuccessMsg("");
    setShowFormPage(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openImageView = (url, alt) => setImageView({ open: true, url, alt });
  const closeImageView = () => setImageView({ open: false, url: "", alt: "" });

  const openAddForm = () => {
    resetForm();
    setShowFormPage(true);
  };

  const closeFormPage = () => {
    resetForm();
    setShowFormPage(false);
  };

  // Main render
  return (
    <div className="p-0 m-0 w-full min-h-screen bg-gray-50">
      {/* Image View Popup */}
      {imageView.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          onClick={closeImageView}
        >
          <div
            className="relative bg-white rounded shadow-lg p-4"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-700 hover:text-red-600 text-2xl font-bold"
              onClick={closeImageView}
              type="button"
            >
              &times;
            </button>
            <img
              src={imageView.url}
              alt={imageView.alt}
              className="max-w-[80vw] max-h-[80vh] object-contain rounded"
            />
            {imageView.alt && (
              <div className="mt-2 text-center text-gray-600 text-sm">{imageView.alt}</div>
            )}
          </div>
        </div>
      )}

      {/* If showFormPage, show only the form page, else show table/list */}
      {showFormPage ? (
        <div className="flex flex-col items-center justify-center min-h-screen py-8">
          <div className="relative bg-gradient-to-br from-pink-50 via-white to-blue-50 shadow-2xl rounded-2xl p-8 border border-blue-100 w-full max-w-3xl mx-auto">
            <button
              className="absolute top-3 right-3 text-gray-700 hover:text-red-600 text-2xl font-bold"
              onClick={closeFormPage}
              type="button"
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-3xl font-extrabold mb-8 text-pink-700 tracking-tight flex items-center gap-2">
              <span className="inline-block bg-pink-100 text-pink-700 px-3 py-1 rounded-lg shadow-sm text-lg">
                <svg className="inline-block w-6 h-6 mr-1 text-pink-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 7V6a4 4 0 014-4h10a4 4 0 014 4v1M3 7v11a4 4 0 004 4h10a4 4 0 004-4V7M3 7h18"></path></svg>
                {editingId ? "Edit Product" : "Add Product"}
              </span>
            </h2>
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-3 mb-4 rounded-lg flex items-center gap-2 shadow">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z"></path></svg>
                <span>{formError}</span>
              </div>
            )}
            {successMsg && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-3 mb-4 rounded-lg flex items-center gap-2 shadow">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"></path></svg>
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-pink-200 rounded-xl bg-pink-50/50
                    focus:outline-none focus:ring-2 focus:ring-pink-400
                    focus:border-pink-400 transition shadow"
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-blue-200 rounded-xl bg-blue-50/50
                    focus:outline-none focus:ring-2 focus:ring-blue-400
                    focus:border-blue-400 transition shadow"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Price</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-yellow-200 rounded-xl bg-yellow-50/50
                    focus:outline-none focus:ring-2 focus:ring-yellow-400
                    focus:border-yellow-400 transition shadow"
                  min="0"
                  placeholder="₹0"
                  required
                />
              </div>

              {/* Variants Table */}
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">Variants</label>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-blue-200 rounded-xl bg-blue-50/30 shadow-sm">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-bold text-blue-700">Color</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-blue-700">Color Name</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-blue-700">SKU</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-blue-700">Stock</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-blue-700">Size</th>
                        <th className="px-3 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.variants.map((variant, idx) => (
                        <tr key={idx} className="bg-white/80">
                          {/* Color Picker */}
                          <td className="px-3 py-2">
                            <input
                              type="color"
                              value={variant.color || "#000000"}
                              onChange={e => handleVariantRowChange(idx, "color", e.target.value)}
                              className="w-8 h-8 border-2 border-gray-300 rounded-full cursor-pointer shadow"
                            />
                          </td>
                          {/* Color Name */}
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={variant.colorName || ColorNameConverter(variant.color)}
                              onChange={e => handleVariantRowChange(idx, "colorName", e.target.value)}
                              className="px-2 py-1 border border-gray-300 bg-gray-100 rounded-lg shadow-sm w-28 text-gray-700 font-medium"
                            />
                            <button
                              type="button"
                              className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition"
                              title="Auto-fill color name"
                              onClick={() => {
                                const autoName = ColorNameConverter(variant.color);
                                handleVariantRowChange(idx, "colorName", autoName);
                              }}
                              tabIndex={-1}
                            >
                              Auto
                            </button>
                          </td>
                          {/* SKU */}
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              placeholder="SKU"
                              value={variant.sku}
                              onChange={e => handleVariantRowChange(idx, "sku", e.target.value)}
                              className="px-2 py-1 border border-purple-200 rounded-lg bg-purple-50/50 focus:ring-2 focus:ring-purple-400 w-24"
                              required
                            />
                          </td>
                          {/* Stock */}
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              placeholder="Stock"
                              value={variant.stock}
                              onChange={e => handleVariantRowChange(idx, "stock", e.target.value)}
                              className="px-2 py-1 border border-green-200 rounded-lg bg-green-50/50 focus:ring-2 focus:ring-green-400 w-20"
                              min="0"
                              required
                            />
                          </td>
                          {/* Size */}
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              placeholder="Size"
                              value={variant.size}
                              onChange={e => handleVariantRowChange(idx, "size", e.target.value)}
                              className="px-2 py-1 border border-indigo-200 rounded-full bg-indigo-50/50 focus:ring-2 focus:ring-indigo-400 w-20"
                              required
                            />
                          </td>
                          {/* Remove row */}
                          <td className="px-3 py-2">
                            {formData.variants.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeVariantRow(idx)}
                                className="bg-red-400 hover:bg-red-600 text-white px-2 py-1 rounded-full text-xs"
                                title="Remove Variant"
                              >
                                &times;
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button
                    type="button"
                    onClick={addVariantRow}
                    className="mt-2 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 active:scale-95
                      text-white font-semibold px-4 py-2 rounded-xl shadow-lg
                      transition-all duration-200 ease-in-out flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"></path></svg>
                    Add Variant
                  </button>
                </div>
              </div>

              {/* Images */}
              <div className="col-span-1 md:col-span-2">
                <h4 className="font-bold text-gray-700 mb-3 text-lg flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 7V6a4 4 0 014-4h10a4 4 0 014 4v1M3 7v11a4 4 0 004 4h10a4 4 0 004-4V7M3 7h18"></path></svg>
                  Product Images
                </h4>
                <div className="space-y-3">
                  {formData.images.map((img, index) => (
                    <div key={index} className="flex gap-3 items-center bg-white border border-blue-100 rounded-xl px-3 py-2 shadow-sm">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(index, "file", e)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-blue-400
                          focus:border-blue-400 transition shadow-sm bg-blue-50/50"
                        required={!editingId}
                      />
                      <input
                        type="text"
                        placeholder="Alt Text"
                        value={img.alt}
                        onChange={(e) => handleImageChange(index, "alt", e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-blue-400
                          focus:border-blue-400 transition shadow-sm bg-blue-50/50"
                      />
                      {formData.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImageField(index)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full shadow transition-all duration-150"
                          title="Remove"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addImageField}
                  className="mt-3 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 active:scale-95
                    text-white font-semibold px-4 py-2 rounded-xl shadow-lg
                    transition-all duration-200 ease-in-out flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"></path></svg>
                  Add Image
                </button>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-pink-400
                    focus:border-pink-400 transition shadow resize-none bg-pink-50/50"
                  placeholder="Describe the product..."
                  rows={4}
                  required
                />
              </div>
              <div className="flex items-center mt-8">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="mr-3 accent-blue-600 w-5 h-5 rounded focus:ring-2 focus:ring-blue-400"
                  id="isActive"
                />
                <label htmlFor="isActive" className="text-gray-700 font-semibold select-none">Active</label>
              </div>
              <div className="col-span-1 md:col-span-2 flex gap-4 mt-6 justify-end">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold px-4 py-1 rounded-xl shadow-lg
                    transition-all duration-200 ease-in-out active:scale-95 flex items-center gap-2"
                  disabled={loading}
                >
                  {editingId ? (loading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M4 12a8 8 0 018-8" strokeOpacity="0.75" strokeLinecap="round"/></svg>
                      Updating...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"></path></svg>
                      Update Product
                    </>
                  )) : (loading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M4 12a8 8 0 018-8" strokeOpacity="0.75" strokeLinecap="round"/></svg>
                      Adding...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"></path></svg>
                      Add Product
                    </>
                  ))}
                </button>
                {editingId && (
                  <button
                    type="button"
                    className="bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold px-6 py-2 rounded-xl shadow-lg
                      hover:from-orange-500 hover:to-orange-600 active:scale-95
                      transition-all duration-200 ease-in-out
                      disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    onClick={resetForm}
                    disabled={loading}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg>
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      ) : (
        <>
          {/* Add Product Button */}
          <div
            className="flex justify-end mb-6 z-30"
            style={{
              position: "sticky",
              top: 0,
              background: "linear-gradient(to right, #f0f4ff 0%, #fff0f6 100%)",
              paddingTop: "1.5rem",
              paddingBottom: "1.5rem",
            }}
          >
            <button
              type="button"
              onClick={openAddForm}
              className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold px-6 py-2 rounded-xl shadow-lg
                transition-all duration-200 ease-in-out active:scale-95 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"></path></svg>
              Add Product
            </button>
          </div>
          {/*Table UI */}
          <div className="bg-gradient-to-br from-blue-50 to-pink-50 shadow-2xl rounded-2xl overflow-x-auto border border-blue-100 p-4 mt-8">
            <table className="w-full border-separate border-spacing-y-2 text-[15px]">
              <thead>
                <tr>
                  <th
                    className="px-5 py-3 text-left font-semibold text-blue-900 bg-blue-100 rounded-tl-xl"
                    style={{
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                      background: "#DBEAFE", // bg-blue-100
                    }}
                  >
                    Name
                  </th>
                  <th
                    className="px-5 py-3 text-left font-semibold text-blue-900 bg-blue-100"
                    style={{
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                      background: "#DBEAFE",
                    }}
                  >
                    Category
                  </th>
                  <th
                    className="px-5 py-3 text-left font-semibold text-blue-900 bg-blue-100"
                    style={{
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                      background: "#DBEAFE",
                    }}
                  >
                    Price
                  </th>
                  <th
                    className="px-5 py-3 text-left font-semibold text-blue-900 bg-blue-100"
                    style={{
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                      background: "#DBEAFE",
                    }}
                  >
                    Variants
                  </th>
                  <th
                    className="px-5 py-3 text-left font-semibold text-blue-900 bg-blue-100"
                    style={{
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                      background: "#DBEAFE",
                    }}
                  >
                    Images
                  </th>
                  <th
                    className="px-5 py-3 text-left font-semibold text-blue-900 bg-blue-100"
                    style={{
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                      background: "#DBEAFE",
                    }}
                  >
                    Active
                  </th>
                  <th
                    className="px-5 py-3 text-left font-semibold text-blue-900 bg-blue-100 rounded-tr-xl"
                    style={{
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                      background: "#DBEAFE",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod, rowIdx) => (
                  <tr
                    key={prod._id}
                    className={`transition-all duration-200 bg-white hover:shadow-lg hover:scale-[1.01] group ${
                      rowIdx % 2 === 0 ? "bg-white" : "bg-blue-50"
                    }`}
                  >
                    <td className="px-5 py-3 rounded-l-xl border-y border-blue-100 font-semibold text-gray-800 group-hover:bg-blue-50 transition">{prod.name}</td>
                    <td className="px-5 py-3 border-y border-blue-100 text-gray-700 group-hover:bg-blue-50 transition">{prod.category?.name || "—"}</td>
                    <td className="px-5 py-3 border-y border-blue-100 text-pink-600 font-bold group-hover:bg-blue-50 transition">₹{prod.price}</td>
                    {/* Variants column: show all variant details */}
                    <td className="px-5 py-3 border-y border-blue-100 group-hover:bg-blue-50 transition">
                      {Array.isArray(prod.variant) && prod.variant.length > 0 ? (
                        <div className="flex flex-col gap-3">
                          {prod.variant.map((v, idx) => (
                            <div key={idx} className="border border-blue-100 rounded-lg p-2 bg-white/80 mb-1">
                              <div className="flex items-center gap-2 mb-1">
                                {/* Color circle and name */}
                                {v.color && (
                                  <span
                                    className="w-5 h-5 rounded-full border-2 border-blue-200 shadow-sm inline-block"
                                    style={{ backgroundColor: v.color }}
                                    title={v.colorName || ColorNameConverter(v.color) || v.color}
                                  ></span>
                                )}
                                <span className="text-xs font-medium text-gray-700">
                                  {v.colorName || ColorNameConverter(v.color) || v.color || "_"}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2 items-center mb-1">
                                {/* Size as badge */}
                                {v.size && (
                                  <span
                                    className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-200 to-pink-200 text-blue-900 text-xs font-semibold shadow"
                                  >
                                    {v.size}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2 items-center">
                                {/* SKU and Stock */}
                                <span className="inline-block bg-pink-100 text-pink-700 px-2 py-0.5 rounded font-medium text-xs">
                                  SKU: {v.sku || "_"}
                                </span>
                                <span className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium text-xs">
                                  Stock: {v.stock !== undefined && v.stock !== null && v.stock !== "" ? v.stock : "_"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">_</span>
                      )}
                    </td>
                    {/* Images */}
                    <td className="px-5 py-3 border-y border-blue-100 group-hover:bg-blue-50 transition">
                      <div className="flex gap-2 flex-wrap">
                        {prod.images?.length > 0 ? (
                          prod.images.map((img, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => openImageView(img.url, img.alt)}
                              className="focus:outline-none hover:scale-110 transition"
                              title={img.alt}
                            >
                              <img
                                src={img.url}
                                alt={img.alt}
                                className="h-12 w-12 object-cover border-2 border-blue-200 rounded-lg shadow"
                              />
                            </button>
                          ))
                        ) : (
                          <span className="text-gray-400">_</span>
                        )}
                      </div>
                    </td>
                    {/* Active */}
                    <td className="px-5 py-3 border-y border-blue-100 group-hover:bg-blue-50 transition">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold shadow ${
                          prod.isActive
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-red-100 text-red-700 border border-red-200"
                        }`}
                      >
                        {prod.isActive ? "Yes" : "No"}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-3 rounded-r-xl border-y border-blue-100 group-hover:bg-blue-50 transition">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(prod)}
                          className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white px-2 py-1 rounded-lg shadow font-semibold transition-all duration-150 active:scale-95"
                        >
                          <span className="material-icons align-middle text-base mr-1">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(prod._id)}
                          className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-2 py-1 rounded-lg shadow font-semibold transition-all duration-150 active:scale-95"
                        >
                          <span className="material-icons align-middle text-base mr-1">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center text-gray-500 py-8 bg-white rounded-b-xl">
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-blue-400" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Loading...
                        </span>
                      ) : (
                        "No products available"
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Product;