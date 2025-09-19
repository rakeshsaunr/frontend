import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { LazyLoadImage } from "react-lazy-load-image-component";
import 'react-lazy-load-image-component/src/effects/blur.css';

// Helper function to capitalize all letters
function toAllCaps(str) {
  if (!str) return "";
  return str.toUpperCase();
}

export default function CollectionPage() {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");

  const API_PRODUCT = `https://navdana-backend-2.onrender.com/api/v1/product/category/${id}`;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(API_PRODUCT);
        let productList = [];
        if (Array.isArray(res.data)) productList = res.data;
        else if (Array.isArray(res.data.products)) productList = res.data.products;
        else if (Array.isArray(res.data.data)) productList = res.data.data;
        setProducts(productList);

        // Try to get category name from the first product, fallback to id
        if (productList.length > 0) {
          setCategoryName(productList[0].category?.name || productList[0].category || id);
        } else {
          setCategoryName(id);
        }
      } catch (error) {
        console.error(error);
        setProducts([]);
        setCategoryName(id);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [id]);

  if (loading) {
    return <p className="text-center py-10">Loading products...</p>;
  }

  if (!products.length) {
    return <p className="text-center py-10">No products found.</p>;
  }

  return (
    <section className="px-6 py-10 bg-white">
      <div className="container mx-auto">
        {/* Breadcrumb */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-base">
            <Link to="/" className="text-gray-400 hover:text-gray-600">Home</Link>
            <span className="text-gray-400">/</span>
            <span className="text-[#42515A] font-medium">
              {toAllCaps(categoryName.replace(/-/g, " "))}
            </span>
          </nav>
        </div>

        {/* Heading */}
        <h2 className="text-3xl font-medium text-center mb-13">
          {categoryName
            ? toAllCaps(categoryName.replace(/-/g, " "))
            : "PRODUCTS"}
        </h2>

        {/* Product Grid */}
        <div className="max-w-8xl mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product._id} className="group bg-white rounded-lg shadow hover:shadow-lg transition flex flex-col">
              
              {/* Image Container → Entire image clickable */}
              <Link
                to={`/product/${product._id}`} 
                className="relative w-full aspect-[3/4] overflow-hidden rounded-lg block"
              >
                <LazyLoadImage
                  src={product.images?.[0]?.url}
                  alt={product.images?.[0]?.alt || product.name}
                  effect="blur"
                  width="100%"
                  height="auto"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  lazy="loading"
                />

                {/* Bottom Left: Price */}
                <div className="absolute bottom-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded font-semibold transition-opacity duration-300 group-hover:opacity-0">
                  ₹{product.price}
                </div>

                {/* Bottom Right: Add to Bag */}
                <div className="absolute bottom-2 right-2 bg-white text-gray-800 p-1 rounded-full shadow transition-opacity duration-300 group-hover:opacity-0">
                  {/* You can add an icon here if needed */}
                </div>

                {/* Hover Quick View */}
                <div className="absolute bottom-2 left-2 right-2 bg-[#2C4A52] text-white text-center py-3 opacity-0 group-hover:opacity-100 transition rounded-[8px]">
                  Quick view
                </div>
              </Link>

              {/* Description and Price */}
              <div className="pt-2 px-2 pb-3 flex-1 flex flex-col justify-between">
                <h3 className="text-sm font-medium text-gray-800 mb-1 truncate">
                  {toAllCaps(product.name)}
                </h3>
                <div className="text-sm font-semibold text-pink-600">
                  ₹{product.price}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
