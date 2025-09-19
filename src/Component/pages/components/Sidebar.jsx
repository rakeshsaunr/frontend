// components/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { RxDashboard } from "react-icons/rx";
import { CgMenuLeftAlt } from "react-icons/cg";
import { MdOutlineClose } from "react-icons/md";

// Dynamic menu items array
const menuItems = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: <RxDashboard className="inline-block text-lg" />,
    className: "flex items-center space-x-2",
  },
  {
    to: "/dashboard/category",
    label: "Category",
    icon: <span role="img" aria-label="Category">🗂</span>,
  },
  {
    to: "/dashboard/product",
    label: "Product",
    icon: <span role="img" aria-label="Product">📦</span>,
  },
  {
    to: "/dashboard/banners",
    label: "Banners",
    icon: <span role="img" aria-label="Banners">🖼</span>,
  },
  {
    to: "/dashboard/users",
    label: "Users",
    icon: <span role="img" aria-label="Users">👤</span>,
  },
  {
    to: "/dashboard/orders",
    label: "Orders",
    icon: <span role="img" aria-label="Orders">📝</span>,
  },
  {
    to: "/dashboard/reports",
    label: "Reports",
    icon: <span role="img" aria-label="Reports">📊</span>,
  },
  {
    to: "/dashboard/calendar",
    label: "Calendar",
    icon: <span role="img" aria-label="Calendar">🗓️</span>,
  },
  {
    to: "/dashboard/settings",
    label: "Settings",
    icon: <span role="img" aria-label="Settings">⚙</span>,
  },
];

export default function Sidebar() {
  const [open, setOpen] = useState(window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();

  // Track screen size to auto-open sidebar on desktop, auto-close on mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setOpen(!mobile);
    };

    // Set initial state
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sidebar overlay for mobile
  return (
    <>
      {/* Mobile Toggle Button (fixed at top left) */}
      {isMobile && (
        <button
          onClick={() => setOpen(true)}
          className="fixed top-2 left-4 z-40 p-2 rounded-md text-2xl md:hidden"
          aria-label="Open sidebar"
          style={{ display: open ? "none" : "block" }}
        >
          <CgMenuLeftAlt />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${isMobile ? "fixed z-50 top-0 left-0 h-full" : "sticky top-0 h-screen"}
          w-64 bg-white shadow-md p-4 flex flex-col
          transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:w-64
        `}
        style={{ minHeight: "100vh" }}
      >
        {/* Header Section (logo on desktop only, close button on all screens) */}
        <div className="flex items-center justify-between h-8 bg-white px-2">
          {/* Logo: show on desktop, hide on mobile */}
          <img
            src="/logo.png"
            alt="Logo"
            className="h-10 w-auto hidden md:block"
          />
          <span className="text-xl font-bold md:hidden">Menu</span>
          {/* Close button: only show on mobile */} 
            {isMobile && (
              <button
                onClick={() => setOpen(false)}
                className={`text-2xl md:hidden ${open ? "block" : "hidden"}`}
                aria-label="Close sidebar"
              >
                <MdOutlineClose />
              </button>
            )}
            
        </div>
        <div className="my-4 border-t border-gray-200" />
        {/* Menu Links */}
        <ul className="mt-4 space-y-2 flex-1">
          {menuItems.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className={`block px-4 py-2 hover:bg-gray-100 rounded transition-colors ${
                  item.className ? item.className : ""
                } ${
                  location.pathname === item.to
                    ? "bg-gray-200 font-semibold"
                    : ""
                }`}
                onClick={() => {
                  // On mobile, close sidebar after navigation
                  if (isMobile) setOpen(false);
                }}
              >
                {item.icon} <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {isMobile && open && (
        <div
          className="fixed inset-0 bg-transparent bg-opacity-30 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}