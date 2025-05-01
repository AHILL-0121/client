"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Home, 
  Package, 
  ShoppingCart, 
  BarChart2, 
  User,
  LogOut
} from "lucide-react";

const Sidebar = () => {
  const pathname = usePathname();

  // Define the navigation menu items with icons
  const menuItems = [
    { name: "Overview", path: "/merchant/overview", icon: <Home className="w-5 h-5" /> },
    { name: "Products", path: "/merchant/products", icon: <Package className="w-5 h-5" /> },
    { name: "Orders", path: "/merchant/orders", icon: <ShoppingCart className="w-5 h-5" /> },
    { name: "Inventory", path: "/merchant/inventory", icon: <BarChart2 className="w-5 h-5" /> },
    { name: "Profile", path: "/merchant/profile", icon: <User className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("merctoken");
    window.location.href = "/merchant/login";
  };

  return (
    <div className="fixed top-0 left-0 w-64 h-screen bg-white border-r border-gray-200 flex flex-col z-10 shadow-lg">
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-md bg-indigo-600 flex items-center justify-center">
            <span className="text-xl font-bold text-white">M</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Merchant Hub</h1>
            <p className="text-xs text-gray-500">Dashboard & Management</p>
          </div>
        </div>
      </div>
      
      <nav className="flex flex-col mt-6 flex-grow px-3">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`
                px-4 py-3 mb-2 rounded-lg font-medium text-base
                transition-all duration-200 flex items-center space-x-3
                ${isActive 
                  ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600" 
                  : "text-gray-700 hover:bg-gray-100"
                }
              `}
            >
              {item.icon}
              <span>{item.name}</span>
              {isActive && (
                <div className="ml-auto h-2 w-2 rounded-full bg-indigo-600"></div>
              )}
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-auto p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Logged in as</p>
            <p className="text-sm font-semibold text-gray-800">Merchant</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
