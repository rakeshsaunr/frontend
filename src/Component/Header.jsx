import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Menu,
  Search,
  ShoppingCart,
  User,
  LogOut,
  LayoutDashboard,
  Package,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "/logo.png";
import { useCart } from "../context/CartContext";

// Redux imports
import { useSelector, useDispatch } from "react-redux";
import {
  setUser,
  setToken,
  clearAuth,
} from "../app/authSlice"; // You need to create this slice
import { setCategories as setCategoriesRedux } from "../app/categorySlice"; // You need to create this slice

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state
  const authState = useSelector((state) => state.auth);
  const categories = useSelector((state) => state.category.categories);
  const { cart } = useCart();

  // On mount, sync Redux auth state with localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      dispatch(setUser(storedUser));
      dispatch(setToken(storedToken));
    }
  }, [dispatch]);

  // Fetch categories and store in Redux
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "https://navdana-backend-2.onrender.com/api/v1/category"
        );
        if (Array.isArray(response.data.categories)) {
          const activeCategories = response.data.categories.filter(
            (cat) => cat.isActive && cat.name !== "All Products"
          );
          const finalCategories = [
            { _id: "all-products", name: "All Products" },
            ...activeCategories,
          ];
          dispatch(setCategoriesRedux(finalCategories));
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, [dispatch]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate("/");
  };

  const handleCategoryClick = (category) => {
    if (category._id === "all-products") {
      navigate("/all-products");
    } else {
      navigate(`/collection-pages/${category._id}`);
    }
    setIsOpen(false);
  };

  const openLoginPopup = () => {
    setShowEmailPopup(true);
    setDropdownOpen(false);
  };

  const sendOtp = async () => {
    if (!email.trim()) {
      alert("Please enter your email");
      return;
    }
    try {
      setLoading(true);
      await axios.post(
        "https://navdana-backend-2.onrender.com/api/v1/user/send-otp",
        { email }
      );
      setLoading(false);
      setShowEmailPopup(false);
      setShowOtpPopup(true);
    } catch {
      setLoading(false);
      alert("Failed to send OTP");
    }
  };

  const verifyOtp = async () => {
    if (!otp.trim()) {
      alert("Please enter OTP");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(
        "https://navdana-backend-2.onrender.com/api/v1/user/verify",
        { email, otp },
        {
          withCredentials: true,
        }
      );
      setLoading(false);

      const { user: loggedInUser, token: authToken } = res.data;
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      localStorage.setItem("token", authToken);

      dispatch(setUser(loggedInUser));
      dispatch(setToken(authToken));

      setShowOtpPopup(false);
      setEmail("");
      setOtp("");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch {
      setLoading(false);
      alert("Invalid OTP, try again");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    dispatch(clearAuth());
    navigate("/");
    setDropdownOpen(false);
  };

  return (
    <header className="w-full shadow-lg bg-white sticky top-0 z-50">
      {/* Top promotional strip */}
      <div className="text-center bg-gray-950 text-white py-3 animate-fade-in">
        <p className="text-sm sm:text-base font-semibold tracking-wide animate-pulse">
          ⚡ Limited time offer: Get 20% off your first order! ⚡
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center animate-slide-down">
        {/* Left Section: Mobile Menu & Logo */}
        <div className="flex items-center space-x-4 animate-fade-in-left">
          <button
            className="lg:hidden p-2 text-gray-800 transition-transform hover:scale-110"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-shrink-0">
            <img
              src={logo}
              alt="Company Logo"
              className="h-10 sm:h-12 w-auto cursor-pointer transition-transform duration-300 hover:scale-105"
              onClick={handleLogoClick}
            />
          </div>
        </div>

        {/* Center Section: Desktop Nav */}
        <nav className="hidden lg:flex flex-1 justify-center items-center space-x-10">
          {categories.map((item, index) => (
            <button
              key={item._id || item.name}
              className={`text-gray-800 hover:text-black font-semibold transition-colors relative group animate-stagger-fade-in`}
              style={{ animationDelay: `${index * 0.15}s` }}
              onClick={() => handleCategoryClick(item)}
            >
              {item.name}
              <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-black transform -translate-x-1/2 group-hover:w-full transition-all duration-300 ease-out"></span>
            </button>
          ))}
        </nav>

        {/* Right Section: Icons */}
        <div className="flex items-center space-x-6 animate-fade-in-right">
          {/* Search */}
          <button
            onClick={() => navigate("/coming-soon")}
            aria-label="Search"
            className="transition-transform hover:scale-110"
          >
            <Search className="w-6 h-6 text-gray-700 hover:text-gray-900 transition-colors" />
          </button>

          {/* Cart */}
          <div
            className="relative cursor-pointer transition-transform hover:scale-110"
            onClick={() => navigate("/cart")}
            aria-label="Shopping Cart"
          >
            <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-gray-900 transition-colors" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-4 w-4 text-xs font-bold text-white bg-red-600 rounded-full ring-2 ring-white animate-bounce-in">
                {cart.length}
              </span>
            )}
          </div>

          {/* User / Login */}
          {!authState.user ? (
            <button
              onClick={openLoginPopup}
              aria-label="Login"
              className="transition-transform hover:scale-110"
            >
              <User className="w-6 h-6 text-gray-700 hover:text-gray-900 transition-colors" />
            </button>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="p-1 rounded-full transition-transform hover:scale-110"
                aria-label="User Menu"
              >
                <User className="w-6 h-6 text-gray-700 hover:text-gray-900 transition-colors" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-lg shadow-2xl ring-1 ring-black ring-opacity-10 z-50 transform origin-top-right animate-fade-in-up">
                  <div
                    className="py-2"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    <div className="px-4 py-3 text-sm text-gray-800 border-b border-gray-100 font-medium">
                      <div className="truncate">{authState.user.email}</div>
                    </div>
                    {authState.user.role === "admin" && (
                      <button
                        onClick={() => {
                          navigate("/dashboard");
                          setDropdownOpen(false);
                        }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <LayoutDashboard size={18} /> Dashboard
                      </button>
                    )}
                    {authState.user.role === "customer" && (
                      <button
                        onClick={() => {
                          navigate("/my-orders");
                          setDropdownOpen(false);
                        }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Package size={18} /> My Orders
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={18} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Nav */}
      <div
        className={`lg:hidden transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <nav className="bg-gray-50 border-t border-gray-200 px-4 py-2 space-y-1">
          {categories.map((item) => (
            <button
              key={item._id || item.name}
              className="block w-full text-left font-medium text-gray-700 hover:text-gray-900 transition-colors py-2"
              onClick={() => handleCategoryClick(item)}
            >
              {item.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Email popup */}
      {showEmailPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-2xl animate-scale-in">
            <h2 className="text-2xl font-bold mb-5 text-center">
              Login/Sign Up
            </h2>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 px-4 py-2 rounded-lg w-full text-gray-800 focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowEmailPopup(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={sendOtp}
                className="px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  "Send OTP"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTP popup */}
      {showOtpPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-2xl animate-scale-in">
            <h2 className="text-2xl font-bold mb-5 text-center">Verify OTP</h2>
            <p className="text-sm text-center text-gray-600 mb-4">
              An OTP has been sent to{" "}
              <span className="font-semibold">{email}</span>
            </p>
            <div className="mb-4">
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Enter OTP
              </label>
              <input
                id="otp"
                type="text"
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="border border-gray-300 px-4 py-2 rounded-lg w-full text-gray-800 focus:ring-2 focus:ring-black focus:border-transparent transition-colors text-center tracking-widest"
                maxLength="6"
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowOtpPopup(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={verifyOtp}
                className="px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  "Verify"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up-fade-in">
          <div className="bg-white p-4 rounded-lg shadow-xl flex items-center gap-3 border border-green-200">
            <CheckCircle className="text-green-500 w-6 h-6" />
            <span className="text-gray-800 font-medium">
              Successfully logged in!
            </span>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
