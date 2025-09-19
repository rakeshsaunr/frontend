import React, { useState, useEffect, useRef } from 'react';
import { LuEye } from "react-icons/lu";

// The main App component, which will be the default export.
export default function App() {
  // Replace these with your actual Instagram credentials
  // NOTE: In a production app, you should not hardcode these.
  const DEMO_USER_ID = "";
  const DEMO_ACCESS_TOKEN = "";

  return (
    <div className="min-h-screen overflow-x-hidden">
      <InstagramReels 
        userId={DEMO_USER_ID} 
        accessToken={DEMO_ACCESS_TOKEN} 
      />
    </div>
  );
}

// Instagram Reels component to fetch and display video content.
const InstagramReels = ({ userId, accessToken }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const carouselRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Modal state (no slider)
  const [showModal, setShowModal] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const [muted, setMuted] = useState(true);

  // For Add to Cart in modal
  const [modalAddToCartVideo, setModalAddToCartVideo] = useState(null);

  // Responsive card width
  const [cardWidth, setCardWidth] = useState(320);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setCardWidth(220);
      else if (window.innerWidth < 1024) setCardWidth(260);
      else setCardWidth(320);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const visibleCards = Math.max(1, Math.floor(window.innerWidth / (cardWidth + 24)));
  const maxSlides = Math.max(0, videos.length - visibleCards);

  // Auto-scroll effect
  useEffect(() => {
    if (videos.length <= visibleCards) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev < maxSlides ? prev + 1 : 0));
    }, 5000);
    return () => clearInterval(interval);
  }, [maxSlides, videos.length, visibleCards]);

  // Scroll the carousel to the current slide
  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        left: currentSlide * (cardWidth + 24),
        behavior: "smooth",
      });
    }
  }, [currentSlide, cardWidth]);

  // Function to open the video modal (no slider)
  const openVideoPopup = (idx) => {
    setModalIndex(idx);
    setMuted(false);
    setShowModal(true);
    setModalAddToCartVideo(null); // Reset add to cart state for modal
  };

  // Function to toggle mute state in the modal
  const toggleMute = () => setMuted((prev) => !prev);

  // Share handler
  const handleShareProduct = (video) => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Instagram Reel',
          text: video.caption || 'Check out this Instagram Reel!',
          url: video.permalink || window.location.href,
        })
        .catch(() => {});
    } else {
      // fallback: copy link
      navigator.clipboard.writeText(video.permalink || window.location.href);
      alert("Product link copied to clipboard!");
    }
  };

  // View Bag handler (for demo, just alert)
  const handleViewBag = (video) => {
    alert("View Bag: " + (truncateCaption(video.caption, 30) || "Instagram Reel"));
  };

  useEffect(() => {
    const fetchInstagramReels = async () => {
      // Check for placeholder values to provide a more specific error
      if (userId === "YOUR_INSTAGRAM_USER_ID" || accessToken === "YOUR_INSTAGRAM_ACCESS_TOKEN") {
        setError('Please replace the placeholder values for your User ID and Access Token in the code to fetch data.');
        setLoading(false);
        return;
      }

      // Existing check for null/empty values
      if (!userId || !accessToken) {
        setError('User ID and Access Token are required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `https://graph.instagram.com/${userId}/media?fields=id,media_type,media_url,thumbnail_url,caption,permalink,timestamp,like_count&access_token=${accessToken}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Filter only videos (reels)
        const videoData = data.data?.filter(item => item.media_type === 'VIDEO') || [];
        
        setVideos(videoData);
      } catch (err) {
        console.error('Error fetching Instagram reels:', err);
        setError('Failed to fetch Instagram reels. Please check your credentials.');
      } finally {
        setLoading(false);
      }
    };

    fetchInstagramReels();
  }, [userId, accessToken]);

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateCaption = (caption, maxLength = 100) => {
    if (!caption) return '';
    return caption.length > maxLength 
      ? caption.substring(0, maxLength) + '...' 
      : caption;
  };

  // Dummy add to cart handler
  const handleAddToCart = (video) => {
    alert("Added to cart: " + (truncateCaption(video.caption, 30) || "Instagram Reel"));
  };

  // Add to cart handler for modal
  const handleModalAddToCart = (video) => {
    setModalAddToCartVideo(video.id);
    setTimeout(() => setModalAddToCartVideo(null), 1200);
    alert("Added to cart: " + (truncateCaption(video.caption, 30) || "Instagram Reel"));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-white">
        <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mb-4"></div>
        <p className="text-lg font-medium">Loading Instagram Reels...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-white">
        <div className="bg-red-500/20 border border-red-400 rounded-xl p-6 max-w-md text-center shadow-lg">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">Error Loading Reels</h3>
          <p className="text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-white">
        <div className="bg-white/10 border border-white/20 rounded-xl p-8 max-w-md text-center shadow-lg">
          <svg className="w-16 h-16 text-white opacity-60 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <h3 className="text-xl font-semibold mb-2">No Videos Found</h3>
          <p className="text-white opacity-80">No Instagram Reels were found for this account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-medium text-center mb-13">
          Explore & Buy
        </h2>
      </div>

      <div className="relative">
        {/* Prev Button */}
        <button
          onClick={() => currentSlide > 0 && setCurrentSlide(currentSlide - 1)}
          className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 hover:bg-white hover:text-black text-black font-bold rounded-full p-2 sm:p-3 border border-gray-200 transition-all duration-150 ${currentSlide === 0 ? "opacity-40 cursor-not-allowed" : "hover:scale-110"}`}
          disabled={currentSlide === 0}
          aria-label="Previous"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-black" fill="none" stroke="black" strokeWidth={3} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Next Button */}
        <button
          onClick={() => currentSlide < maxSlides && setCurrentSlide(currentSlide + 1)}
          className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-black hover:text-black font-bold rounded-full p-2 sm:p-3 shadow-lg border border-gray-200 transition-all duration-150 ${currentSlide === maxSlides ? "opacity-40 cursor-not-allowed" : "hover:scale-110"}`}
          disabled={currentSlide === maxSlides}
          aria-label="Next"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-black" fill="none" stroke="black" strokeWidth={3} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Carousel */}
        <div
          ref={carouselRef}
          className="flex gap-6 px-2 sm:px-16 py-6 scrollbar-hide scroll-smooth overflow-x-hidden"
          style={{ scrollBehavior: "smooth" }}
        >
          {videos.map((video, idx) => (
            <div key={video.id} className="flex-none" style={{ width: cardWidth }}>
              <div className="bg-white/90 backdrop-blur-md rounded-2xl  overflow-hidden border border-gray-200 duration-200">
                <div className="relative group">
                  <video
                    className="w-full h-64 sm:h-80 md:h-96 object-cover bg-gray-100 group-hover:brightness-90 transition duration-200"
                    poster={video.thumbnail_url}
                    preload="metadata"
                    autoPlay
                    muted
                    loop
                    style={{ aspectRatio: "9/16" }}
                  >
                    <source src={video.media_url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 z-10 shadow">
                    <LuEye className="w-3.5 h-3.5 text-pink-400" />
                    <span>
                      {typeof video.like_count === "number"
                        ? `${video.like_count} View${video.like_count !== 1 ? "s" : ""}`
                        : "View"}
                    </span>
                  </div>

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition duration-200"></div>
                  {/* Play Icon Button */}
                  <button
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 focus:opacity-100"
                    style={{ outline: "none" }}
                    onClick={() => openVideoPopup(idx)}
                    aria-label="Play Reel"
                    tabIndex={0}
                  >
                    <span className=" text-pink-600 font-bold px-4 py-2 rounded-full text-sm flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-7 h-7 text-pink-600"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="12" r="10" fill="#fff" opacity="0.7"/>
                        <polygon points="10,8 16,12 10,16" fill="#ec4899"/>
                      </svg>
                    </span>
                  </button>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="flex gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <img
                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg border-2 border-gray-200 shadow"
                      src={video.thumbnail_url}
                      alt={video.caption}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 text-xs sm:text-sm mb-1 truncate">
                        Instagram Reel
                      </h3>
                      <p className="text-gray-600 text-xs mb-2 truncate">
                        {truncateCaption(video.caption)}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-gray-500">
                          {formatDate(video.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddToCart(video)}
                    className="w-full flex justify-center items-center bg-black text-white py-1 sm:py-2 rounded-md font-semibold hover:bg-gray-900 transition-all duration-200 shadow text-xs sm:text-sm"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal (no slider/slide icons) */}
      {showModal && (
        <VideoModal
          video={videos[modalIndex]}
          showModal={showModal}
          setShowModal={setShowModal}
          muted={muted}
          toggleMute={toggleMute}
          handleViewBag={handleViewBag}
          handleShareProduct={handleShareProduct}
          truncateCaption={truncateCaption}
          formatDate={formatDate}
          handleAddToCart={handleModalAddToCart}
          addToCartVideoId={modalAddToCartVideo}
        />
      )}
    </div>
  );
};

// VideoModal component for full width video on mobile, no slider/slide icons
const VideoModal = ({
  video,
  showModal,
  setShowModal,
  muted,
  toggleMute,
  handleViewBag,
  handleShareProduct,
  truncateCaption,
  formatDate,
  handleAddToCart,
  addToCartVideoId,
}) => {
  // Detect mobile
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Prevent background scroll when modal open (especially for mobile)
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal]);

  // Reduce modal width for desktop/tablet
  // We'll use maxWidth: 320px for desktop/tablet, and full width for mobile
  const modalWidthClass = isMobile
    ? "w-full h-full rounded-none"
    : "w-full max-w-[320px] rounded-2xl";

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-0 sm:p-4"
      onClick={(e) => {
        // Only close if click on overlay, not on modal content
        if (e.target.classList.contains("bg-black/80")) setShowModal(false);
      }}
      style={{
        alignItems: isMobile ? "stretch" : "center",
        justifyContent: isMobile ? "stretch" : "center",
      }}
    >
      <div
        className={`relative bg-black overflow-hidden shadow-2xl border-none flex flex-col ${modalWidthClass}`}
        style={
          isMobile
            ? { maxWidth: "100vw", maxHeight: "100vh", height: "100vh" }
            : { maxWidth: 320 }
        }
      >
        {/* Close Button */}
        <button
          onClick={() => setShowModal(false)}
          className={`absolute top-3 right-3 bg-white/20 hover:bg-white/40 rounded-full p-2 z-30 text-black`}
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Video Content (no slider/slide icons) */}
        <div className="relative flex-1 flex flex-col justify-center items-center">
          <video
            key={video?.media_url}
            className={
              isMobile
                ? "w-full h-full object-contain bg-black"
                : "w-full h-auto bg-black"
            }
            autoPlay
            muted={muted}
            style={
              isMobile
                ? {
                    width: "100vw",
                    height: "100vh",
                    maxWidth: "100vw",
                    maxHeight: "100vh",
                    objectFit: "contain",
                    background: "black",
                  }
                : {
                    width: "100%",
                    maxWidth: "320px",
                    aspectRatio: "9/16",
                    objectFit: "contain",
                    background: "black",
                  }
            }
          >
            <source src={video?.media_url} type="video/mp4" />
          </video>
          {/* Mute Button (left) and Custom Three Dot Menu (right) */}
          <div className="absolute bottom-3 left-0 right-0 flex flex-row justify-between items-center px-3 z-30">
            <button
              onClick={toggleMute}
              className="bg-black/60 hover:bg-black/80 rounded-full p-2 shadow"
              aria-label="Toggle Mute"
            >
              <span className="text-white text-lg">{muted ? "🔇" : "🔊"}</span>
            </button>
            <ThreeDotMenu
              onViewBag={() => handleViewBag(video)}
              onShareProduct={() => handleShareProduct(video)}
            />
          </div>
        </div>
        {/* Optionally, show caption, date, etc. */}
        <div className="p-3 text-white text-center bg-black/80">
          <div className="font-semibold text-sm mb-1 truncate">
            {truncateCaption(video?.caption)}
          </div>
          <div className="text-xs opacity-70">
            {formatDate(video?.timestamp)}
          </div>
          {/* Add to Cart Button in Modal */}
          <button
            onClick={() => handleAddToCart(video)}
            className={`mt-3 w-full flex justify-center items-center bg-pink-600 text-white py-2 rounded-md font-semibold hover:bg-pink-700 transition-all duration-200 shadow text-xs sm:text-sm ${
              addToCartVideoId === video?.id ? "opacity-70 pointer-events-none" : ""
            }`}
            disabled={addToCartVideoId === video?.id}
          >
            {addToCartVideoId === video?.id ? "Added!" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Custom Three Dot Menu Component
const ThreeDotMenu = ({ onViewBag, onShareProduct }) => {
  const [open, setOpen] = useState(false);
  // Close menu on click outside
  const menuRef = useRef();
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white"
        aria-label="More"
      >
        <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg z-50 py-2">
          <button
            onClick={() => { setOpen(false); onViewBag(); }}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-black"
          >
            View Bag
          </button>
          <button
            onClick={() => { setOpen(false); onShareProduct(); }}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-black"
          >
            Share Product
          </button>
        </div>
      )}
    </div>
  );
};
