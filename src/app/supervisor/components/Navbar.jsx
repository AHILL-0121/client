"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const router = useRouter();
  const [supervisorName, setSupervisorName] = useState("Supervisor");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    // Try to get admin name from localStorage if available
    const storedName = localStorage.getItem("supervisorName");
    if (storedName) {
      setSupervisorName(storedName);
    }
  }, []);

  const handleLogout = () => {
    // Remove the adminToken from localStorage
    localStorage.removeItem("supervisorToken");
    localStorage.removeItem("supervisorName");
    // Redirect to the login page
    router.push("/supervisor/login");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="h-16 bg-white flex items-center justify-between px-6 shadow-md z-20 border-b border-blue-100 w-full">
      <div className="flex items-center">
        <h2 className="text-xl font-semibold text-blue-900">
          <span className="text-blue-600 font-bold">Welcome,</span> {supervisorName}
        </h2>
        <span className="h-2 w-2 rounded-full bg-green-500 ml-2 animate-pulse" title="Online"></span>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Notification Bell */}

        
        {/* User Profile Menu */}
        <div className="relative">
          <button 
            onClick={toggleDropdown}
            className="flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 focus:outline-none"
          >
            <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md hover:bg-blue-700 transition-colors">
              {supervisorName.charAt(0).toUpperCase()}
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className={`ml-1 h-5 w-5 transform transition-transform duration-200 text-blue-500 ${isDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          
          {isDropdownOpen && (
            <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-blue-100 z-50">
              <div className="py-1" role="menu" aria-orientation="vertical">
                <a href="/supervisor/profile" className="block px-4 py-2 text-sm text-blue-700 hover:bg-blue-50" role="menuitem">
                  Your Profile
                </a>
                <a href="/supervisor/settings" className="block px-4 py-2 text-sm text-blue-700 hover:bg-blue-50" role="menuitem">
                  Settings
                </a>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  role="menuitem"
                >
                  Logout
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
