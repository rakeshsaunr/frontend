import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import namer from "color-namer";
import {
  XCircle,
  PlusCircle,
  MinusCircle,
  ShoppingCart,
  Loader2,
  Truck,
} from "lucide-react";

// ColorNameConverter function
const ColorNameConverter = (hex) => {
  if (!hex) return "";
  try {
    return namer(hex).basic[0].name;
  } catch {
    return "";
  }
};

export default function CartPage() {
  // Redux is not working, so use localStorage for cart state
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem("cart");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Helper to update cart in state and localStorage
  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const [showCheckout, setShowCheckout] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
    paymentMethod: "razorpay",
  });
  const [loading, setLoading] = useState(false);

  // --- User authentication states ---
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const [showNamePopup, setShowNamePopup] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [showOtpPopup, setShowOtpPopup] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // --- Cart handlers ---
  const handleIncrement = (item) => {
    const idx = cart.findIndex(
      (i) =>
        i._id === item._id &&
        i.size === item.size &&
        i.color === item.color &&
        i.sku === item.sku
    );
    if (idx !== -1) {
      if (cart[idx].quantity < (cart[idx].stock || 1)) {
        const newCart = [...cart];
        newCart[idx] = { ...newCart[idx], quantity: newCart[idx].quantity + 1 };
        updateCart(newCart);
      } else {
        alert("No more stock available for this variant!");
      }
    }
  };

  const handleDecrement = (item) => {
    const idx = cart.findIndex(
      (i) =>
        i._id === item._id &&
        i.size === item.size &&
        i.color === item.color &&
        i.sku === item.sku
    );
    if (idx !== -1) {
      if (cart[idx].quantity > 1) {
        const newCart = [...cart];
        newCart[idx] = { ...newCart[idx], quantity: newCart[idx].quantity - 1 };
        updateCart(newCart);
      } else {
        // Remove item if quantity goes to 0
        const newCart = cart.filter((_, i) => i !== idx);
        updateCart(newCart);
      }
    }
  };

  const handleRemove = (item) => {
    const newCart = cart.filter(
      (i) =>
        !(
          i._id === item._id &&
          i.size === item.size &&
          i.color === item.color &&
          i.sku === item.sku
        )
    );
    updateCart(newCart);
  };

  const handleChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  // --- Checkout flow (name/email/otp) ---
  const startCheckout = () => {
    if (!user) {
      setShowNamePopup(true);
    } else {
      setShowCheckout(true);
    }
  };

  const nextToEmail = () => {
    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }
    setShowNamePopup(false);
    setShowEmailPopup(true);
  };

  const sendOtp = async () => {
    try {
      if (!email.trim()) {
        alert("Please enter your email");
        return;
      }
      setLoading(true);
      await axios.post("https://navdana-backend-2.onrender.com/api/v1/user/send-otp", { email });
      setLoading(false);
      setShowEmailPopup(false);
      setShowOtpPopup(true);
    } catch {
      setLoading(false);
      alert("Failed to send OTP");
    }
  };

  const verifyOtp = async () => {
    try {
      if (!otp.trim()) {
        alert("Please enter OTP");
        return;
      }
      setLoading(true);

      const res = await axios.post(
        "https://navdana-backend-2.onrender.com/api/v1/user/verify",
        { name, email, otp, token: token || null },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true,
        }
      );

      setLoading(false);

      const { user: loggedInUser, token: authToken } = res.data;
      setUser(loggedInUser);
      setToken(authToken);

      localStorage.setItem("user", JSON.stringify(loggedInUser));
      localStorage.setItem("token", authToken);

      setShowOtpPopup(false);
      setShowCheckout(true);
    } catch {
      setLoading(false);
      alert("Invalid OTP, try again");
    }
  };

  // ---------- Checkout with Razorpay ----------
  const handleCheckout = async () => {
    const { fullName, address, city, postalCode, country } = shippingInfo;
    if (!fullName || !address || !city || !postalCode || !country) {
      alert("Please fill all required shipping details");
      return;
    }

    try {
      setLoading(true);

      // 1) Create order on backend (DB order + Razorpay order)
      const createOrderPayload = {
        items: cart.map((item) => ({
          product: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          size: item.size || "",
          color: item.color || "",
          sku: item.sku || "",
        })),
        shippingAddress: shippingInfo,
      };

      const orderRes = await axios.post(
        "https://navdana-backend-2.onrender.com/api/v1/order",
        createOrderPayload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Backend must return: { order, razorpayOrder, key }
      const { order, razorpayOrder, key } = orderRes.data;

      if (!razorpayOrder || !key) {
        setLoading(false);
        alert("Failed to initialize payment. Try again.");
        return;
      }

      // 2) Dynamically load Razorpay SDK (if not present)
      if (!window.Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = () => reject(new Error("Razorpay SDK failed to load"));
        });
      }

      // 3) Configure Razorpay checkout options
      const options = {
        key, // public key returned by backend
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Navdana Store",
        description: `Order #${order._id}`,
        order_id: razorpayOrder.id,
        handler: async function (response) {
          // This handler runs after successful payment in Razorpay popup
          try {
            setLoading(true);
            // 4) Verify payment on backend
            const verifyRes = await axios.post(
              "https://navdana-backend-2.onrender.com/api/v1/order/verify",
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                // optionally send DB order id so backend can also use it
                orderId: order._id,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            setLoading(false);

            if (verifyRes.data && verifyRes.data.success) {
              alert("Payment Successful & Order Placed!");
              // Clear cart in localStorage and state
              updateCart([]);
              setShowCheckout(false);
            } else {
              console.error("Verify response:", verifyRes.data);
              alert("Payment verification failed! If amount was charged, contact support.");
            }
          } catch (err) {
            setLoading(false);
            console.error("Verify error:", err);
            alert("Payment verification failed. Please try again or contact support.");
          }
        },
        prefill: {
          name: shippingInfo.fullName || user?.name || "",
          email: user?.email || "",
          contact: shippingInfo.phone || (user?.phone || ""),
        },
        notes: {
          orderId: order?._id || "", // optional
        },
        theme: { color: "#000000" },
      };

      // 4) Open Razorpay popup
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (resp) {
        // optional: handle payment failure event
        console.error("Razorpay payment failed:", resp);
        alert("Payment failed. Please try again.");
      });
      rzp.open();

      // keep loading false because popup is open
      setLoading(false);
    } catch (err) {
      console.error("Create order / checkout error:", err);
      setLoading(false);

      // give user a helpful error
      if (err.response && err.response.data && err.response.data.message) {
        alert("Checkout failed: " + err.response.data.message);
      } else {
        alert("Checkout failed, try again.");
      }
    }
  };

  // --- Empty cart UI ---
  if (cart.length === 0)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50 p-6">
        <ShoppingCart className="w-24 h-24 text-gray-400 mb-6" />
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">Your Cart is Empty</h2>
        <p className="mb-6 text-gray-600 max-w-md text-center">
          Looks like you haven’t added anything to your cart yet. Browse our products and find something you love!
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <h2 className="text-4xl sm:text-5xl font-extrabold text-center text-gray-900 mb-10 tracking-tight">
        <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          Your Cart
        </span>
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items Section */}
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item, idx) => (
            <div
              key={`${item._id}-${item.size}-${item.color}-${item.sku}-${idx}`}
              className="flex flex-col sm:flex-row items-center p-6 rounded-xl transition-all duration-300"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-36 h-36 sm:w-44 sm:h-44 object-contain"
              />
              <div className="flex-1 sm:ml-6 flex flex-col justify-center mt-4 sm:mt-0">
                <div className="flex justify-between items-start w-full">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-gray-600 mt-1">₹{item.price.toFixed(2)}</p>
                    <div className="text-sm text-gray-500 mt-2 space-y-1">
                      {item.size && <p>Size: {item.size}</p>}
                      {item.color && (
                        <div className="flex items-center gap-2">
                          <span>Color:</span>
                          <span
                            className="w-4 h-4 rounded-full border border-gray-300 inline-block"
                            style={{ backgroundColor: item.color }}
                            title={item.color}
                          ></span>
                          <span>{ColorNameConverter(item.color) || item.color}</span>
                        </div>
                      )}
                      {item.sku && <p>SKU: {item.sku}</p>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(item)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    aria-label="Remove item"
                  >
                    <XCircle size={24} />
                  </button>
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <button
                    onClick={() => handleDecrement(item)}
                    className="p-1 text-gray-600 hover:text-gray-800 transition"
                  >
                    <MinusCircle size={24} />
                  </button>
                  <span className="px-3 py-1 border border-gray-300 rounded-md font-medium text-gray-800">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleIncrement(item)}
                    className="p-1 text-gray-600 hover:text-gray-800 transition"
                  >
                    <PlusCircle size={24} />
                  </button>
                </div>
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-auto text-xl font-bold text-gray-900">
                ₹{(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Section */}
        <div className="lg:col-span-1 p-6 rounded-xl h-fit sticky top-4">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h3>
          <div className="flex justify-between items-center mb-4 text-lg">
            <span className="text-gray-700">Subtotal ({cart.length} items):</span>
            <span className="font-semibold text-gray-900">₹{totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200 text-lg">
            <span className="text-gray-700">Shipping:</span>
            <span className="font-semibold text-gray-900">FREE</span>
          </div>
          <div className="flex justify-between items-center text-2xl font-bold mb-6">
            <span className="text-gray-900">Total:</span>
            <span className="text-indigo-600">₹{totalPrice.toFixed(2)}</span>
          </div>
          <button
            onClick={startCheckout}
            className="w-full px-8 py-4 bg-indigo-600 text-white font-semibold text-lg rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="animate-spin h-6 w-6 mx-auto" />
            ) : (
              "Proceed to Checkout"
            )}
          </button>
        </div>
      </div>

      {/* Popups (Name → Email → OTP → Checkout) */}
      {showNamePopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl animate-fade-in">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Enter Your Name</h2>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowNamePopup(false)}
                className="px-5 py-2 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={nextToEmail}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {showEmailPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl animate-fade-in">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Enter Your Email</h2>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowEmailPopup(false)}
                className="px-5 py-2 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={sendOtp}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  "Send OTP"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showOtpPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl animate-fade-in">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Enter OTP</h2>
            <input
              type="text"
              placeholder="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded-lg w-full text-center tracking-widest text-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowOtpPopup(false)}
                className="px-5 py-2 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={verifyOtp}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  "Verify & Continue"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-8 relative shadow-2xl animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
              <Truck size={24} /> Shipping Details
            </h2>
            <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
              <input
                type="text"
                placeholder="Full Name"
                name="fullName"
                value={shippingInfo.fullName}
                onChange={handleChange}
                className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                required
              />
              <input
                type="text"
                placeholder="Address"
                name="address"
                value={shippingInfo.address}
                onChange={handleChange}
                className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                required
              />
              <input
                type="text"
                placeholder="City"
                name="city"
                value={shippingInfo.city}
                onChange={handleChange}
                className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                required
              />
              <input
                type="text"
                placeholder="Postal Code"
                name="postalCode"
                value={shippingInfo.postalCode}
                onChange={handleChange}
                className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                required
              />
              <input
                type="text"
                placeholder="Country"
                name="country"
                value={shippingInfo.country}
                onChange={handleChange}
                className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                required
              />
              <input
                type="text"
                placeholder="Phone"
                name="phone"
                value={shippingInfo.phone}
                onChange={handleChange}
                className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setShowCheckout(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-5 w-5 mx-auto" />
                  ) : (
                    `Pay ₹${totalPrice.toFixed(2)}`
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}