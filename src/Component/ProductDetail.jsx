import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { MdArrowBackIos, MdStraighten } from "react-icons/md";
import namer from "color-namer";

const ColorNameConverter = (hex) => {
  if (!hex) return "";
  try {
    return namer(hex).basic[0].name;
  } catch {
    return "";
  }
};

// Helper to detect mobile device (viewport width)
function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);
  return isMobile;
}

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Zoom modal state for showpage
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomModalSlide, setZoomModalSlide] = useState(0);

  // Size chart modal state
  const [showSizeChart, setShowSizeChart] = useState(false);

  // Zoom state for main image
  const [isZoomed, setIsZoomed] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({});

  const zoomImgRef = useRef(null);

  const { addToCart } = useCart();

  const isMobile = useIsMobile();

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await axios.get(`https://navdana-backend-2.onrender.com/api/v1/product/${id}`);
        setProduct(res.data.data);
        if (res.data.data.images?.length > 0) {
          setSelectedImage(res.data.data.images[0].url || res.data.data.images[0].img);
          setCurrentSlide(0);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchProduct();
  }, [id]);

  if (!product) return <p className="p-6">Loading...</p>;

  const sizes = [...new Set(product.variant?.map((v) => v.size))];
  const colors = [...new Set(product.variant?.map((v) => v.color))];

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size before adding to cart!");
      return;
    }
    if (!selectedColor) {
      alert("Please select a color before adding to cart!");
      return;
    }

    addToCart(
      {
        _id: product._id,
        name: product.name,
        price: product.price,
        image: selectedImage,
        size: selectedSize,
        color: selectedColor,
        sku: product.variant?.find(
          (v) => v.size === selectedSize && v.color === selectedColor
        )?.sku,
      },
      quantity
    );

    alert("Product added to cart!");
  };

  const descriptionPoints = product.description
    ?.split(/•|\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const handlePrev = () => {
    if (!product?.images?.length) return;
    setCurrentSlide((prev) => {
      const newIdx = prev === 0 ? product.images.length - 1 : prev - 1;
      setSelectedImage(product.images[newIdx].url || product.images[newIdx].img);
      return newIdx;
    });
  };

  const handleNext = () => {
    if (!product?.images?.length) return;
    setCurrentSlide((prev) => {
      const newIdx = prev === product.images.length - 1 ? 0 : prev + 1;
      setSelectedImage(product.images[newIdx].url || product.images[newIdx].img);
      return newIdx;
    });
  };

  const handleThumbnailClick = (imgSrc, idx) => {
    setSelectedImage(imgSrc);
    setCurrentSlide(idx);
  };

  // Helper to get images except the size chart image (index 4)
  const getDisplayImages = () => {
    if (!product.images) return [];
    // If there are at least 5 images, skip index 4
    if (product.images.length > 4) {
      return product.images.filter((img, idx) => idx !== 4);
    }
    return product.images;
  };

  // If selectedImage is the size chart image, reset to first image
  // (This can happen if user reloads on modal open)
  if (
    product.images &&
    product.images[4] &&
    selectedImage === (product.images[4].url || product.images[4].img)
  ) {
    setSelectedImage(product.images[0].url || product.images[0].img);
  }

  const displayImages = getDisplayImages();

  // Zoom Modal Handlers (showpage)
  const openZoomModal = (idx) => {
    setZoomModalSlide(idx ?? currentSlide);
    setShowZoomModal(true);
  };
  const closeZoomModal = () => setShowZoomModal(false);

  const handleZoomModalPrev = (e) => {
    e && e.stopPropagation();
    if (!displayImages.length) return;
    setZoomModalSlide((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };
  const handleZoomModalNext = (e) => {
    e && e.stopPropagation();
    if (!displayImages.length) return;
    setZoomModalSlide((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  // Set the transform origin to the mouse position
  const handleMouseMove = (e) => {
    if (!zoomImgRef.current) return;
    const rect = zoomImgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomStyle({
      transform: 'scale(2)',
      transformOrigin: `${x}% ${y}%`
    });
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setZoomStyle({});
    setIsHovering(false);
  };

  const handleTapToZoom = () => {
    setIsZoomed(!isZoomed);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-full md:max-w-6xl mx-auto bg-white rounded-xl">
      {/* Zoom Modal for showpage */}
      {showZoomModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={closeZoomModal}
        >
          <div
            className="relative bg-white rounded-xl shadow-lg flex flex-col items-center justify-center p-0 w-full h-full"
            style={{ maxWidth: "100vw", maxHeight: "100vh" }}
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-4 text-3xl text-gray-500 hover:text-black z-10"
              onClick={closeZoomModal}
              aria-label="Close"
            >
              ×
            </button>
            <div className="flex items-center justify-center w-full h-full relative">
              {/* Desktop/Tablet: arrows on left/right, Mobile: arrows at bottom */}
              {/* For mobile, hide these arrows, show at bottom instead */}
              <button
                className="hidden sm:block absolute left-2 top-1/2 -translate-y-1/2 hover:bg-white text-2xl rounded-full p-2"
                onClick={handleZoomModalPrev}
                aria-label="Previous"
                style={{ zIndex: 2 }}
              >
                <MdArrowBackIos />
              </button>
              <div
                className="pswp__img pswp__img--placeholder pswp__img--placeholder--blank flex items-center justify-center"
                style={{
                  width: "100vw",
                  height: "100vh",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "0",
                  overflow: "hidden"
                }}
              >
                <img
                  src={displayImages[zoomModalSlide]?.url || displayImages[zoomModalSlide]?.img}
                  alt={displayImages[zoomModalSlide]?.alt || `${product.name}-${zoomModalSlide}`}
                  className="w-100 h-auto object-contain"
                  style={{ background: "#fff", maxWidth: "100vw", maxHeight: "100vh" }}
                />
              </div>
              <button
                className="hidden sm:block absolute right-2 top-1/2 -translate-y-1/2 hover:bg-white text-2xl rounded-full p-2"
                onClick={handleZoomModalNext}
                aria-label="Next"
                style={{ zIndex: 2 }}
              >
                <MdArrowBackIos style={{ transform: "scaleX(-1)" }} />
              </button>
              {/* Mobile slide arrows and dot at center */}
              {isMobile && (
                <div className="sm:hidden absolute bottom-4 left-0 right-0 flex flex-col items-center z-20">
                  <div className="flex justify-center items-center gap-4">
                    <button
                      className=" hover:bg-white text-2xl rounded-full p-3"
                      onClick={handleZoomModalPrev}
                      aria-label="Previous"
                      style={{ zIndex: 2 }}
                    >
                      <MdArrowBackIos />
                    </button>
                    {/* Dots in between arrows */}
                    <div className="flex justify-center items-center gap-2">
                      {displayImages.map((img, idx) => (
                        <span
                          key={idx}
                          className={`inline-block transition-all duration-200 rounded-full ${
                            zoomModalSlide === idx
                              ? "bg-black w-3 h-3"
                              : "bg-gray-300 w-2 h-2"
                          }`}
                          style={{
                            width: zoomModalSlide === idx ? 12 : 8,
                            height: zoomModalSlide === idx ? 12 : 8,
                          }}
                        ></span>
                      ))}
                    </div>
                    <button
                      className=" hover:bg-white text-2xl p-3"
                      onClick={handleZoomModalNext}
                      aria-label="Next"
                      style={{ zIndex: 2 }}
                    >
                      <MdArrowBackIos style={{ transform: "scaleX(-1)" }} />
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4 overflow-x-auto max-w-full px-4 pb-4">
              {displayImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img.url || img.img}
                  alt={img.alt || `${product.name}-${idx}`}
                  className={`w-16 h-16 object-cover rounded cursor-pointer border-2 ${
                    zoomModalSlide === idx ? "border-black" : "border-gray-200"
                  }`}
                  onClick={() => setZoomModalSlide(idx)}
                  style={{ objectFit: "cover" }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-5">
        {/* Images */}
        <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
          {/* Mobile Slider */}
          <div className="block sm:hidden w-full relative">
            {displayImages && displayImages.length > 0 && (
              <div className="relative w-full overflow-x-scroll flex snap-x snap-mandatory">
                {displayImages.map((img, idx) => (
                  <div 
                    key={idx} 
                    className="flex-shrink-0 w-full h-[400px] snap-center"
                    onClick={() => openZoomModal(idx)}
                  >
                    <img
                      src={img.url || img.img}
                      alt={img.alt || `${product.name}-${idx}`}
                      className="w-full h-full object-contain bg-white transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Thumbnails (desktop) */}
          <div className="hidden sm:flex flex-row sm:flex-col gap-2 sm:gap-4 overflow-x-auto sm:overflow-y-auto max-h-[90px] sm:max-h-[500px]">
            {displayImages.map((img, idx) => {
              const imgSrc = img.url || img.img;
              return (
                <img
                  key={idx}
                  src={imgSrc}
                  alt={img.alt || `${product.name}-${idx}`}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-conatain bg-transparent cursor-pointer border-2 ${
                    selectedImage === imgSrc ? "border-black shadow-md" : "border-gray-200"
                  }`}
                  style={{ objectFit: "fill" }}
                  onClick={() => handleThumbnailClick(imgSrc, idx)}
                />
              );
            })}
          </div>

          {/* Main Image with Zoom Button */}
          <div 
            className="hidden sm:flex flex-1 items-start justify-center overflow-hidden relative"
          >
            <img
              ref={zoomImgRef}
              src={selectedImage}
              alt={product.name}
              className={`w-full max-w-[400px] h-[500px] rounded-xl object-fill cursor-crosshair transition-transform duration-200 ease-out ${isZoomed ? 'scale-150' : ''}`}
              style={isHovering ? zoomStyle : {
                transform: "scale(1)",
                transition: "transform 0.2s ease-out"
              }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={handleTapToZoom}
            />
            {/* Zoom View Button */}
            <button
              type="button"
              className="absolute top-0 right-4 bg-white bg-opacity-80 hover:bg-opacity-100 border border-gray-300 rounded-full p-1 shadow-md transition-all duration-150 flex items-center"
              onClick={() => openZoomModal(currentSlide)}
              title="Zoom View"
              tabIndex={0}
            >
              {/* Magnifier icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none"/>
                <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-4 sm:gap-6 mt-4 md:mt-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium text-gray-900">{product.name}</h1>
          <p className="text-xl sm:text-2xl font-semibold text-gray-700">₹{product.price}</p>

          {/* Description */}
          {descriptionPoints?.length > 0 && (
            <div>
              <h2 className="font-semibold text-base sm:text-lg mb-2">Description:</h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-1 text-sm sm:text-base">
                {descriptionPoints.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Colors */}
          {colors.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="font-medium">Color:</span>
              <div className="flex gap-3">
                {colors.map((hex, idx) => (
                  <div
                    key={idx}
                    className={`w-8 h-8 rounded-full border-2 cursor-pointer flex items-center justify-center ${
                      selectedColor === hex ? "border-black" : "border-gray-300"
                    }`}
                    style={{ backgroundColor: hex }}
                    onClick={() => setSelectedColor(hex)}
                    title={ColorNameConverter(hex)}
                  >
                    {selectedColor === hex && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                ))}
              </div>
              {selectedColor && <span className="text-sm text-gray-600">{ColorNameConverter(selectedColor)}</span>}
            </div>
          )}

          {/* Sizes */}
          {sizes.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">Size:</span>
                {/* Size Chart Button */}
                <button
                  type="button"
                  className="ks-chart-modal-link sizing-chart-modal-link with-icon flex items-center gap-1"
                  onClick={() => setShowSizeChart(true)}
                >
                  <MdStraighten className="inline-block text-lg" />
                  Size Chart
                </button>
              </div>
              <div className="flex gap-3">
                {sizes.map((size) => (
                  <div
                    key={size}
                    className={`px-4 py-2 cursor-pointer border rounded text-center font-medium ${
                      selectedSize === size ? "bg-black text-white border-black" : "bg-gray-100 border-gray-300"
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Size Chart Modal */}
          {showSizeChart && product.images && product.images[4] && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
              onClick={() => setShowSizeChart(false)}
            >
              <div
                className="bg-white w-[95vw] md:w-[700px] max-h-[90vh] rounded-xl overflow-y-auto shadow-lg relative p-6"
                onClick={e => e.stopPropagation()}
              >
                <button
                  className="absolute top-0 right-4 text-2xl text-gray-800 hover:text-black"
                  onClick={() => setShowSizeChart(false)}
                  aria-label="Close"
                >
                  ×
                </button>
                <div className="mb-4 flex justify-center">
                  <img
                    src={product.images[4].url || product.images[4].img}
                    alt="Size Chart"
                    className="max-w-full max-h-[70vh] rounded"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Quantity counter */}
          <div className="flex items-center gap-4 mt-4">
            <button
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 font-bold"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              -
            </button>
            <span className="px-3 py-1 border rounded text-lg font-medium">{quantity}</span>
            <button
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 font-bold"
              onClick={() => setQuantity((q) => q + 1)}
            >
              +
            </button>
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            className="bg-black text-white px-6 py-3 rounded-lg text-lg font-semibold shadow-md hover:bg-gray-800 mt-4"
          >
            🛒 Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}