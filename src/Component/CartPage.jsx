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
import { useSelector, useDispatch } from "react-redux";
import {
  incrementCartItem,
  decrementCartItem,
  removeCartItem,
  clearCart,
} from "../app/cartSlice";

// ColorNameConverter function (safe)
const ColorNameConverter = (hex) => {
  if (!hex) return "";
  try {
    return namer(hex).basic[0].name;
  } catch {
    return "";
  }
};

export default function CartPage() {
  const cart = useSelector((state) => state.cart.items);
  const count = useSelector((state) => state.cart.count);
  const dispatch = useDispatch();

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

  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const [showNamePopup, setShowNamePopup] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [showOtpPopup, setShowOtpPopup] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const totalPrice = cart.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity || 0)), 0);

  // handlers
  const handleIncrement = (item) => {
    dispatch(incrementCartItem({
      _id: item._id,
      size: item.size,
      color: item.color,
      sku: item.sku
    }));
  };

  const handleDecrement = (item) => {
    dispatch(decrementCartItem({
      _id: item._id,
      size: item.size,
      color: item.color,
      sku: item.sku
    }));
  };

  const handleRemove = (item) => {
    dispatch(removeCartItem({
      _id: item._id,
      size: item.size,
      color: item.color,
      sku: item.sku
    }));
  };

  const handleChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

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

  // Razorpay checkout (same as original)
  const handleCheckout = async () => {
    const { fullName, address, city, postalCode, country } = shippingInfo;
    if (!fullName || !address || !city || !postalCode || !country) {
      alert("Please fill all required shipping details");
      return;
    }

    try {
      setLoading(true);

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

      const { order, razorpayOrder, key } = orderRes.data;

      if (!razorpayOrder || !key) {
        setLoading(false);
        alert("Failed to initialize payment. Try again.");
        return;
      }

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

      const options = {
        key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Navdana Store",
        description: `Order #${order._id}`,
        order_id: razorpayOrder.id,
        handler: async function (response) {
          try {
            setLoading(true);
            const verifyRes = await axios.post(
              "https://navdana-backend-2.onrender.com/api/v1/order/verify",
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                orderId: order._id,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setLoading(false);
            if (verifyRes.data && verifyRes.data.success) {
              alert("Payment Successful & Order Placed!");
              dispatch(clearCart());
              setShowCheckout(false);
            } else {
              alert("Payment verification failed! If amount was charged, contact support.");
            }
          } catch {
            setLoading(false);
            alert("Payment verification failed. Please try again or contact support.");
          }
        },
        prefill: {
          name: shippingInfo.fullName || user?.name || "",
          email: user?.email || "",
          contact: shippingInfo.phone || (user?.phone || ""),
        },
        notes: {
          orderId: order?._id || "",
        },
        theme: { color: "#000000" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function () {
        alert("Payment failed. Please try again.");
      });
      rzp.open();
      setLoading(false);
    } catch (err) {
      setLoading(false);
      if (err.response && err.response.data && err.response.data.message) {
        alert("Checkout failed: " + err.response.data.message);
      } else {
        alert("Checkout failed, try again.");
      }
    }
  };

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
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 min-h-screen">
      <h2 className="text-4xl sm:text-5xl font-medium text-center text-gray-900 mb-10 tracking-tight">
        <span className="text-black text-3xl sm:text-4xl font-samibold">Your Cart</span>
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item, idx) => (
            <div
              key={`${item._id}-${item.size || ""}-${item.color || ""}-${item.sku || ""}-${idx}`}
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
                    <p className="text-gray-600 mt-1">₹{Number(item.price).toFixed(2)}</p>
                    <div className="text-sm text-gray-500 mt-2 space-y-1">
                      {item.size && <p>Size: {item.size}</p>}
                      {item.color && (
                        <div className="flex items-center gap-2">
                          <span>Color:</span>
                          <span
                            className="w-4 h-4 rounded-full border border-gray-300 inline-block"
                            style={{ backgroundColor: item.color }}
                            title={item.color}
                          />
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
                ₹{(Number(item.price) * Number(item.quantity || 0)).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1 p-6 rounded-xl h-fit sticky top-4">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h3>
          <div className="flex justify-between items-center mb-4 text-lg">
            <span className="text-gray-700">Subtotal ({count} items):</span>
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
            className="w-full px-4 py-2 bg-black text-white font-semibold text-base rounded-md shadow hover:bg-gray-900 transition-colors disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : "Proceed to Checkout"}
          </button>
        </div>
      </div>

      {/* Popups (Name → Email → OTP → Checkout) */}
      {showNamePopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Enter Your Name</h2>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowNamePopup(false)} className="px-5 py-2 text-gray-700 rounded-lg">Cancel</button>
              <button onClick={nextToEmail} className="px-5 py-2 bg-indigo-600 text-white rounded-lg">Next</button>
            </div>
          </div>
        </div>
      )}

      {showEmailPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Enter Your Email</h2>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 transition-colors" />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowEmailPopup(false)} className="px-5 py-2 text-gray-700 rounded-lg">Cancel</button>
              <button onClick={sendOtp} className="px-5 py-2 bg-indigo-600 text-white rounded-lg">{loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Send OTP"}</button>
            </div>
          </div>
        </div>
      )}

      {showOtpPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Enter OTP</h2>
            <input type="text" placeholder="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="border border-gray-300 px-4 py-2 rounded-lg w-full text-center tracking-widest text-lg font-mono focus:ring-2 focus:ring-indigo-500 transition-colors" />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowOtpPopup(false)} className="px-5 py-2 text-gray-700 rounded-lg">Cancel</button>
              <button onClick={verifyOtp} className="px-5 py-2 bg-indigo-600 text-white rounded-lg">{loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Verify & Continue"}</button>
            </div>
          </div>
        </div>
      )}

      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-8 relative shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2"><Truck size={24} /> Shipping Details</h2>
            <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder="Full Name" name="fullName" value={shippingInfo.fullName} onChange={handleChange} className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 transition-colors" required />
              <input type="text" placeholder="Address" name="address" value={shippingInfo.address} onChange={handleChange} className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 transition-colors" required />
              <input type="text" placeholder="City" name="city" value={shippingInfo.city} onChange={handleChange} className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 transition-colors" required />
              <input type="text" placeholder="Postal Code" name="postalCode" value={shippingInfo.postalCode} onChange={handleChange} className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 transition-colors" required />
              <input type="text" placeholder="Country" name="country" value={shippingInfo.country} onChange={handleChange} className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 transition-colors" required />
              <input type="text" placeholder="Phone" name="phone" value={shippingInfo.phone} onChange={handleChange} className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 transition-colors" />
              <div className="flex justify-between mt-6">
                <button type="button" onClick={() => setShowCheckout(false)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg">Cancel</button>
                <button type="button" onClick={handleCheckout} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg" disabled={loading}>{loading ? <Loader2 className="animate-spin h-5 w-5" /> : `Pay ₹${totalPrice.toFixed(2)}`}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
