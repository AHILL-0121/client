"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AddressSection from "./AddressSection";
import CartSummary from "./CartSummary";
import { FiShoppingCart, FiMapPin } from "react-icons/fi";

export default function CheckoutPage() {
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
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
      className="min-h-screen bg-gray-50 py-10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="mt-2 text-gray-600">Complete your purchase by providing shipping details and payment information</p>
          
          <div className="mt-6 flex items-center space-x-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
              <FiShoppingCart size={16} />
            </div>
            <div className="h-0.5 flex-1 bg-gray-200"></div>
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${selectedAddress ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              <FiMapPin size={16} />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full lg:w-2/3"
          >
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800">Shipping Information</h2>
                <p className="text-sm text-gray-500 mt-1">Choose where you want your items delivered</p>
              </div>
              <div className="p-6">
                <AddressSection onAddressSelect={setSelectedAddress} />
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full lg:w-1/3"
          >
            <div className="bg-white shadow-sm rounded-lg overflow-hidden sticky top-6">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800">Order Summary</h2>
                <p className="text-sm text-gray-500 mt-1">Review your items and complete payment</p>
              </div>
              <div className="p-6">
                <CartSummary selectedAddress={selectedAddress} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
