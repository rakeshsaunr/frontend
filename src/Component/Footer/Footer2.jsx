import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import axios from "axios";
import { BsFillThreadsFill } from "react-icons/bs";
import { FaSquareInstagram } from "react-icons/fa6";

// If you use custom icons, import them here or replace with SVGs as needed
const Facebook = (props) => (
  <svg {...props} fill="currentColor" viewBox="0 0 24 24">
    <path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/>
  </svg>
);

const animatedIcon = "animated-icon";
const animatedCard = "animated-card";

const Footer = () => {
    // Newsletter state
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [errorMsg, setErrorMsg] = useState('');

    // Categories state
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [catError, setCatError] = useState('');

    // ✅ Fetch categories from backend
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get("https://navdana-backend-2.onrender.com/api/v1/category");
                if (Array.isArray(res.data.categories)) {
                    const activeCategories = res.data.categories.filter(
                        (cat) => cat.isActive && cat.name !== "All Products"
                    );
                    const finalCategories = [
                        { _id: "all-products", name: "All Products" },
                        ...activeCategories,
                    ];
                    setCategories(finalCategories);
                }
            } catch (err) {
                console.error("Error fetching footer categories:", err);
                setCatError("Failed to load categories");
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    // Simulate async newsletter subscription
    const handleNewsletter = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMsg('');
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1200));
        // Simple email validation
        if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(email)) {
            setStatus('error');
            setErrorMsg('Please enter a valid email address.');
            return;
        }
        setStatus('success');
        setEmail('');
        setTimeout(() => setStatus('idle'), 2500);
    };

    return (
        <>
            <style jsx="true">{`
                @keyframes logoPulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.07); }
                    100% { transform: scale(1); }
                }
                @keyframes shimmer {
                    0% { background-position: -400px 0; }
                    100% { background-position: 400px 0; }
                }
                .shimmer-bg {
                    background: linear-gradient(90deg, #f3f3f3 25%, #f9e6f0 50%, #f3f3f3 75%);
                    background-size: 400px 100%;
                    animation: shimmer 2s infinite linear;
                }
                .logo-pulse {
                    filter: drop-shadow(0 1px 4px rgba(0,0,0,0.12));
                    animation: logoPulse 2.5s infinite alternate;
                }
                .animated-icon {
                    transition: transform 0.3s ease-in-out;
                }
                .animated-icon:hover {
                    transform: scale(1.1) translateY(-4px);
                }
                .animated-list-item {
                    transition: all 0.3s ease-in-out;
                }
                .animated-list-item:hover {
                    padding-left: 8px;
                    color: #ec4899;
                }
                .animated-button {
                    transition: all 0.3s ease-in-out;
                }
                .animated-button:hover {
                    transform: scale(1.05);
                }
                .animated-button:active {
                    transform: scale(0.95);
                }
                .animated-card {
                    transition: box-shadow 0.3s, transform 0.3s;
                }
                .animated-card:hover {
                    box-shadow: 0 4px 16px rgba(236,72,153,0.15);
                    transform: translateY(-2px) scale(1.04);
                }
                /* Custom for vertical divider */
                .footer-divider {
                    border-left: 1.5px solid #e5e7eb;
                    height: 100%;
                    margin: 0 0.5rem;
                }
                /* Mobile responsive overrides */
                @media (max-width: 1023px) {
                    .footer-divider {
                        display: none !important;
                    }
                }
            `}</style>
            <footer className="bg-white text-gray-900 relative overflow-hidden font-sans">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                    {/* Responsive flex for sections with vertical divider */}
                    {/* MOBILE: Stack sections vertically, hide dividers */}
                    <div className="flex flex-col gap-8 lg:gap-0 lg:flex-row items-stretch justify-center">
                        {/* Section 0: Logo */}
                        <div className="flex flex-col items-center sm:items-start mb-8 lg:mb-0 lg:mr-10">
                            <Link to="/" className="mb-4 no-underline">
                                <div className="logo-pulse">
                                    <img
                                        src="/logo.png"
                                        alt="Navdana Logo"
                                        width={35}
                                        height={35}
                                        className="h-10 w-auto mb-3"
                                        aria-label="Navdana Logo"
                                    />
                                </div>
                            </Link>
                            <span className="text-xs text-gray-500 mt-1 text-center sm:text-left">Ethnic Wear for Women</span>
                        </div>

                        {/* Divider */}
                        <div className="hidden lg:block footer-divider self-stretch" />

                        {/* Categories */}
                        <div className="flex-1">
                            <h4 className="text-sm tracking-widest font-semibold mb-4 text-center lg:text-left">
                                CATEGORIES
                            </h4>
                            {loadingCategories && (
                                <p className="text-center text-gray-500 text-sm">Loading...</p>
                            )}
                            {catError && (
                                <p className="text-center text-red-500 text-sm">{catError}</p>
                            )}
                            {!loadingCategories && !catError && (
                                <ul className="space-y-2 text-sm text-center lg:text-left">
                                    {categories.map((cat) => (
                                        <li key={cat._id}>
                                            <Link
                                                to={
                                                    cat._id === "all-products"
                                                        ? "/all-products"
                                                        : `/collection-pages/${cat._id}`
                                                }
                                                className="hover:text-pink-500 transition-colors"
                                            >
                                                {cat.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="hidden lg:block footer-divider self-stretch" />

                        {/* Section 2: Information */}
                        <div className="flex-1 flex flex-col items-center sm:items-center lg:items-start mb-8 lg:mb-0 px-0 lg:px-8 w-full">
                            <h4 className="text-sm tracking-widest font-semibold mb-4 text-center lg:text-left">INFORMATION</h4>
                            <ul className="space-y-2 text-sm text-center sm:text-left">
                                <li><Link to="/about" className="animated-list-item block">About Us</Link></li>
                                <li><Link to="/terms-conditions" className="animated-list-item block">Terms & Conditions</Link></li>
                                <li><Link to="/contact" className="animated-list-item block">Contact Us</Link></li>
                                <li><Link to="/career" className="animated-list-item block">Careers</Link></li>
                                {/* <li><Link to="/our-team" className="animated-list-item block">Our Team</Link></li> */}
                                <li><Link to="/faqs" className="animated-list-item block">FAQs</Link></li>
                            </ul>
                        </div>

                        {/* Divider */}
                        <div className="hidden lg:block footer-divider self-stretch" />

                        {/* Section 3: Policies */}
                        <div className="flex-1 flex flex-col items-center sm:items-center lg:items-start mb-8 lg:mb-0 px-0 lg:px-8 w-full">
                            <h4 className="text-sm tracking-widest font-semibold mb-4 text-center lg:text-left">POLICIES</h4>
                            <ul className="space-y-2 text-sm text-center sm:text-left">
                                <li><Link to="/return-exchange-request" className="animated-list-item block">Return/Exchange Request</Link></li>
                                <li><Link to="/shiping-policy" className="animated-list-item block">Shipping Policy</Link></li>
                                <li><Link to="/privacy-policy" className="animated-list-item block">Privacy Policy</Link></li>
                                <li><Link to="/returns-exchanges" className="animated-list-item block">Return & Exchange Policy</Link></li>
                                <li><Link to="/cancel-policy" className="animated-list-item block">Cancellation Policy</Link></li>
                                <li><Link to="/refund-policy" className="animated-list-item block">Refund Policy</Link></li>
                            </ul>
                        </div>

                        {/* Divider */}
                        <div className="hidden lg:block footer-divider self-stretch" />

                        {/* Section 5: Newsletter */}
                        <div className="flex-1 flex flex-col items-center sm:items-center lg:items-start px-0 lg:px-8 w-full">
                            <h4 className="text-sm tracking-widest font-semibold mb-4 text-center lg:text-left">NEWSLETTER</h4>
                            <p className="text-sm text-gray-600 mb-4 text-center lg:text-left">Subscribe to get special offers, free giveaways, and updates.</p>
                            <form className="space-y-3 w-full max-w-xs mx-auto" onSubmit={handleNewsletter} autoComplete="off">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className={`w-full px-3 py-2 border ${status === 'error' ? 'border-red-400' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm`}
                                    value={email}
                                    onChange={e => {
                                        setEmail(e.target.value);
                                        if (status === 'error') setStatus('idle');
                                    }}
                                    disabled={status === 'loading' || status === 'success'}
                                    required
                                    aria-label="Email address"
                                />
                                <button
                                    type="submit"
                                    className={`animated-button ${status === 'success'
                                        ? 'bg-green-500 hover:bg-green-600'
                                        : status === 'loading'
                                            ? 'bg-pink-400'
                                            : 'bg-pink-500 hover:bg-pink-600'
                                    } text-white px-4 py-2 rounded-md font-semibold shadow-md w-full text-sm flex items-center justify-center`}
                                    disabled={status === 'loading' || status === 'success'}
                                    aria-live="polite"
                                >
                                    {status === 'loading' && (
                                        <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                        </svg>
                                    )}
                                    {status === 'success'
                                        ? 'Subscribed!'
                                        : status === 'loading'
                                            ? 'Subscribing...'
                                            : 'Subscribe'}
                                </button>
                                {status === 'error' && (
                                    <div className="text-xs text-red-500">{errorMsg}</div>
                                )}
                                {status === 'success' && (
                                    <div className="text-xs text-green-600">Thank you for subscribing!</div>
                                )}
                            </form>
                        </div>
                    </div>

                    {/* Bottom: Copyright + Follow Us Row */}
                    <div className="border-t border-gray-200 mt-8 sm:mt-12 pt-6 sm:pt-8">
                        <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4">
                            {/* Copyright */}
                            <p className="text-sm text-gray-600 mb-2 md:mb-0 text-center md:text-left">
                                © 2025 Navdana Apparels. All rights reserved.
                            </p>
                            {/* Follow Us Row */}
                            <div className="flex flex-wrap items-center justify-center space-x-2 mb-2 md:mb-0">
                                <span className="text-sm text-gray-700 mr-2">Follow us</span>
                                <Link
                                    to="https://facebook.com/navdana"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Facebook"
                                    className={`inline-flex p-1 rounded-md bg-gray-100 hover:bg-gray-200 transition group ${animatedIcon}`}
                                    style={{ textDecoration: "none" }}
                                >
                                    <Facebook className="h-6 w-6 text-[#1778F2] group-hover:text-[#1778F2]" />
                                </Link>
                                <Link
                                    to="https://instagram.com/navdana"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Instagram"
                                    className={`inline-flex p-1 rounded-md bg-gray-100 hover:bg-gray-200 transition group ${animatedIcon}`}
                                    style={{ textDecoration: "none" }}
                                >
                                    <FaSquareInstagram className="h-6 w-6 text-pink-500 group-hover:text-pink-500" />
                                </Link>
                                <Link
                                    to="https://threads.net/navdana"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Threads"
                                    className={`inline-flex p-1 rounded-md bg-gray-100 hover:bg-gray-200 transition group ${animatedIcon}`}
                                    style={{ textDecoration: "none" }}
                                >
                                    <BsFillThreadsFill className="h-6 w-6 text-black group-hover:text-black" />
                                </Link>
                                <Link
                                    to="https://linkedin.com/navdana"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="LinkedIn"
                                    className={`inline-flex p-1 rounded-md bg-gray-100 hover:bg-gray-200 transition group ${animatedIcon}`}
                                    style={{ textDecoration: "none" }}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        className="h-6 w-6 text-blue-700 group-hover:text-blue-700"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.85-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.354V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.368-1.85 3.598 0 4.262 2.368 4.262 5.452v6.289zM5.337 7.433a2.062 2.062 0 01-2.063-2.064c0-1.138.925-2.063 2.063-2.063 1.137 0 2.063.925 2.063 2.063 0 1.139-.926 2.064-2.063 2.064zm1.777 13.019H3.56V9h3.554v11.452zM22.225 0H1.771C.792 0 0 .771 0 1.729v20.542C0 23.229.792 24 1.771 24h20.451C23.2 24 24 23.229 24 22.271V1.729C24 .771 23.2 0 22.225 0z" />
                                    </svg>
                                </Link>
                                <Link
                                    to="https://www.youtube.com/navdana"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="YouTube"
                                    className={`inline-flex p-1 rounded-md bg-gray-100 hover:bg-gray-200 transition group ${animatedIcon}`}
                                    style={{ textDecoration: "none" }}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        className="h-6 w-6 text-red-600 group-hover:text-red-600"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M23.498 6.186a2.994 2.994 0 0 0-2.107-2.117C19.19 3.5 12 3.5 12 3.5s-7.19 0-9.391.569A2.994 2.994 0 0 0 .502 6.186C0 8.39 0 12 0 12s0 3.61.502 5.814a2.994 2.994 0 0 0 2.107 2.117C4.81 20.5 12 20.5 12 20.5s7.19 0 9.391-.569a2.994 2.994 0 0 0 2.107-2.117C24 15.61 24 12 24 12s0-3.61-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                    </svg>
                                </Link>
                            </div>
                            {/* Privacy/Terms/Cookies */}
                            {/* <div className="flex space-x-6 text-sm">
                                <Link to="/privacy" className="text-gray-600 hover:text-pink-500 transition-colors">Privacy</Link>
                                <Link to="/terms" className="text-gray-600 hover:text-pink-500 transition-colors">Terms</Link>
                                <Link to="/cookies" className="text-gray-600 hover:text-pink-500 transition-colors">Cookies</Link>
                            </div> */}
                            {/* We Accept */}
                            <div className="flex items-center space-x-3 mt-4 md:mt-0 overflow-x-auto no-scrollbar px-1">
                                <span className="text-gray-700 text-sm flex-shrink-0">We accept</span>
                                {/* Visa */}
                                <Link
                                    to="https://www.visa.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`bg-gray-100 rounded-md p-1 shadow ${animatedCard}`}
                                    title="Visa"
                                    style={{ textDecoration: "none" }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32" className="h-4 w-auto">
                                        <path d="M22.5 22.6l1.5-9.2h2.4l-1.5 9.2h-2.4zM34.3 13.5c-.5-.2-1.3-.4-2.3-.4-2.5 0-4.3 1.3-4.3 3.1 0 1.3 1.3 2 2.2 2.4.9.4 1.2.7 1.2 1.1 0 .6-.7.9-1.3.9-.9 0-1.4-.1-2.1-.4l-.3-.1-.3 2c.5.2 1.5.4 2.5.4 2.6 0 4.4-1.3 4.5-3.2 0-1.1-.7-2-2.1-2.6-.9-.4-1.5-.7-1.5-1.1 0-.4.5-.8 1.3-.8.7 0 1.3.2 1.7.4l.2.1.4-1.9zm5.3-.3h-1.9c-.6 0-1 .2-1.3.8l-3.6 8.6h2.5s.4-1.2.5-1.5h3.1c.1.3.3 1.5.3 1.5h2.2l-2.1-9.4zM11.7 22.6l2.4-9.2h2.3l-2.4 9.2h-2.3zm-3.8-9.2l-2.2 6-1.1-5.5c-.2-.6-.6-.8-1.2-.9H.2l-.1.4c.9.2 1.8.5 2.4.8.4.2.5.4.6.8l1.8 7.2h2.4l3.7-9.2H7.9z"/>
                                    </svg>
                                </Link>
                                {/* Mastercard */}
                                <Link
                                    to="https://www.mastercard.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`bg-gray-100 rounded-md p-1 shadow ${animatedCard}`}
                                    title="Mastercard"
                                    style={{ textDecoration: "none" }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32" className="h-4 w-auto">
                                        <circle cx="18" cy="16" r="8" fill="#EB001B"/>
                                        <circle cx="30" cy="16" r="8" fill="#F79E1B"/>
                                        <path d="M24 8a8 8 0 0 0 0 16 8 8 0 0 0 0-16z" fill="#FF5F00"/>
                                    </svg>
                                </Link>
                                {/* RuPay */}
                                <Link
                                    to="https://www.rupay.co.in/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`bg-gray-100 rounded-md p-1 shadow ${animatedCard}`}
                                    title="RuPay"
                                    style={{ textDecoration: "none" }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32" className="h-4 w-auto">
                                        <text x="4" y="21" fontSize="12" fontWeight="bold" fill="#1A237E">Ru</text>
                                        <text x="20" y="21" fontSize="12" fontWeight="bold" fill="#FF9800">Pay</text>
                                    </svg>
                                </Link>
                                {/* Amex */}
                                <Link
                                    to="https://www.americanexpress.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`bg-gray-100 rounded-md p-1 shadow ${animatedCard}`}
                                    title="American Express"
                                    style={{ textDecoration: "none" }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32" className="h-4 w-auto">
                                        <rect width="48" height="32" fill="#2E77BC"/>
                                        <text x="6" y="21" fontSize="11" fontWeight="bold" fill="white">AMEX</text>
                                    </svg>
                                </Link>
                                {/* Paytm */}
                                <Link
                                    to="https://paytm.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`bg-gray-100 rounded-md p-1 shadow ${animatedCard}`}
                                    title="Paytm"
                                    style={{ textDecoration: "none" }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32" className="h-4 w-auto">
                                        <text x="4" y="21" fontSize="12" fontWeight="bold" fill="#00B9F1">Pay</text>
                                        <text x="26" y="21" fontSize="12" fontWeight="bold" fill="#002970">tm</text>
                                    </svg>
                                </Link>
                                {/* UPI */}
                                <Link
                                    to="https://www.npci.org.in/what-we-do/upi/product-overview"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`bg-gray-100 rounded-md p-1 shadow ${animatedCard}`}
                                    title="UPI"
                                    style={{ textDecoration: "none" }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32" className="h-4 w-auto">
                                        <text x="8" y="21" fontSize="12" fontWeight="bold" fill="#2E7D32">UPI</text>
                                    </svg>
                                </Link>
                                {/* Google Pay */}
                                <Link
                                    to="https://pay.google.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`bg-gray-100 rounded-md p-1 shadow ${animatedCard}`}
                                    title="Google Pay"
                                    style={{ textDecoration: "none" }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32" className="h-4 w-auto">
                                        <text x="4" y="21" fontSize="12" fontWeight="bold" fill="#4285F4">G</text>
                                        <text x="16" y="21" fontSize="12" fontWeight="bold" fill="#34A853">P</text>
                                        <text x="26" y="21" fontSize="12" fontWeight="bold" fill="#FBBC05">a</text>
                                        <text x="34" y="21" fontSize="12" fontWeight="bold" fill="#EA4335">y</text>
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default Footer;
