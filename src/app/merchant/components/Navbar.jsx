"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  Bell, 
  ChevronDown, 
  User, 
  LogOut, 
  Settings,
  Search
} from "lucide-react";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [merchantName, setMerchantName] = useState("Merchant");
  const [searchQuery, setSearchQuery] = useState("");

  // Get title based on current path
  const getTitle = () => {
    const path = pathname.split("/").pop();
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  useEffect(() => {
    // Could fetch merchant info here in a real application
    const fetchMerchantInfo = async () => {
      try {
        // Mock fetch for now
        setMerchantName("Acme Store");
      } catch (error) {
        console.error("Error fetching merchant info:", error);
      }
    };
    
    fetchMerchantInfo();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("merctoken");
    router.push("/merchant/login");
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality here
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="sticky top-0 z-10 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center">
        <h2 className="text-xl font-semibold text-gray-800">{getTitle()}</h2>
        <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full ml-3 font-medium">
          Merchant
        </span>
      </div>

      <div className="hidden md:flex items-center relative max-w-md w-1/3 mx-4">
        <form onSubmit={handleSearch} className="w-full">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </form>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Notification Icon */}

        
        {/* User Menu */}
        <div className="relative">
          <button 
            onClick={toggleDropdown}
            className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200"
          >
            <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
              {merchantName.charAt(0)}
            </div>
            <span className="text-gray-800 font-medium hidden md:block">{merchantName}</span>
            <ChevronDown className="h-4 w-4 text-gray-600" />
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <p className="text-sm font-semibold text-gray-800">{merchantName}</p>
                <p className="text-xs text-gray-500">Merchant Account</p>
              </div>
              
              <div className="py-1">
                <a href="/merchant/profile" className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-100 gap-2">
                  <User className="w-4 h-4" />
                  <span>Profile Settings</span>
                </a>
                <a href="#" className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-100 gap-2">
                  <Settings className="w-4 h-4" />
                  <span>Account Settings</span>
                </a>
              </div>
              
              <div className="py-1 border-t border-gray-200">
                <button 
                  onClick={handleLogout} 
                  className="w-full flex items-center px-4 py-2.5 text-red-600 hover:bg-red-50 gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
