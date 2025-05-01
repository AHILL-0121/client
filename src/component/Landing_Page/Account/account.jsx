"use client"; // Required for using useState and rendering client-side
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Wishlist from "@/component/Landing_Page/Wishlist/Wishlist";
import OrderList from "@/component/Landing_Page/YourOrder/YourOrder";
import AddressSection from "@/component/Landing_Page/CheckoutPage/AddressSection";
import ProfileInfo from "./profileinfo";
import { FiUser, FiMapPin, FiPackage, FiHeart } from "react-icons/fi";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const tabs = [
    { id: "profile", label: "Profile", icon: <FiUser className="mr-2" /> },
    { id: "address", label: "Addresses", icon: <FiMapPin className="mr-2" /> },
    { id: "orders", label: "Orders", icon: <FiPackage className="mr-2" /> },
    { id: "wishlist", label: "Wishlist", icon: <FiHeart className="mr-2" /> },
  ];

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        mass: 1
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="mt-2 text-gray-600">Manage your profile, addresses, orders and wishlist</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex overflow-x-auto scrollbar-hide py-2">
            <div className="flex space-x-2 mx-auto">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`flex items-center py-2 px-4 text-sm font-medium rounded-md whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.icon}
                  {tab.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content with Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-sm"
          >
            {activeTab === "profile" && <ProfileInfo />}
            {activeTab === "address" && (
              <div className="p-6">
                <AddressSection onAddressSelect={() => {}} />
              </div>
            )}
            {activeTab === "orders" && <OrderList />}
            {activeTab === "wishlist" && <Wishlist />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
