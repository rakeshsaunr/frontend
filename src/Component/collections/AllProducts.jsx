import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import 'react-lazy-load-image-component/src/effects/blur.css';

export default function AllProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(" https://navdana-backend-2.onrender.com/api/v1/product");
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setProducts(data.data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return <p className="text-center py-10">Loading products...</p>;
  }

  if (!products.length) {
    return <p className="text-center py-10">No products found.</p>;
  }

  return (
    <section className="px-6 py-10 bg-white">
      <div className="container mx-auto">
        {/* Heading */}
        <h2 className="text-3xl font-medium text-center mb-13">
          ALL PRODUCTS
        </h2>

        {/* Product Grid */}
        <div className="max-w-8xl mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {currentProducts.map((product) => (
            <div key={product._id} className="group bg-white rounded-lg shadow hover:shadow-lg transition flex flex-col">
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
                  {product.name}
                </h3>
                <div className="text-sm font-semibold text-pink-600">
                  ₹{product.price}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center mt-10 space-x-2">
          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx + 1}
              onClick={() => handlePageChange(idx + 1)}
              className={`px-4 py-2 rounded border ${
                currentPage === idx + 1
                  ? "bg-[#2C4A52] text-white"
                  : "bg-white text-gray-800"
              } transition`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
