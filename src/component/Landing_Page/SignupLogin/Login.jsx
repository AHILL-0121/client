"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Popup from "@/component/Landing_Page/CheckoutPage/Popup";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function LoginPage() {
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const closePopup = () => {
    setShowPopup(false);
  };
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post(`${apiBaseUrl}/login`, formData, {
        headers: { "Content-Type": "application/json" },
      });
  
      localStorage.setItem("authToken", response.data.token);
      
      // Show success popup before redirecting
      setPopupMessage("Login successful! Redirecting...");
      setShowPopup(true);
      
      // Delay redirect to allow user to see success message
      setTimeout(() => {
        router.push("/");
      }, 1500);
      
    } catch (error) {
      console.error("Error logging in:", error);
      setPopupMessage("Login failed. Please check your credentials and try again.");
      setShowPopup(true);
      setLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <>
      <div className="min-h-screen w-full flex flex-col lg:flex-row">
        {/* Left side: Image (hidden on mobile, appears first in mobile view) */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#024E82] to-blue-900 items-center justify-center overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative w-full h-full"
          >
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-10 text-center">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Welcome Back!</h2>
              <p className="text-blue-100 text-lg max-w-md">Sign in to access your account and explore our latest fashion collections.</p>
            </div>
            <div className="absolute inset-0 opacity-20">
              <img
                src="/checkout/login.svg"
                alt="Welcome illustration"
                className="h-full w-full object-cover"
              />
            </div>
          </motion.div>
        </div>
        
        {/* Right side: Login form */}
        <motion.div 
          className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12 md:px-8 lg:px-12 xl:px-20 bg-white"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="w-full max-w-md">
            <motion.div 
              variants={itemVariants}
              className="text-center lg:text-left mb-10"
            >
              <h1 className="text-3xl font-bold text-gray-800 mb-3">Login to Your Account</h1>
              <p className="text-gray-600">
                Enter your credentials to access your account
              </p>
            </motion.div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FiMail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#024E82] focus:border-transparent transition-colors"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div variants={itemVariants}>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-[#024E82] hover:text-blue-700 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FiLock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    required
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#024E82] focus:border-transparent transition-colors"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>

              {/* Remember me */}
              <motion.div variants={itemVariants} className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="w-4 h-4 border-gray-300 rounded text-[#024E82] focus:ring-[#024E82]"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-600 cursor-pointer">
                  Remember me for 30 days
                </label>
              </motion.div>

              {/* Login Button */}
              <motion.div variants={itemVariants}>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-lg text-white font-medium transition-all ${
                    loading 
                      ? "bg-blue-400 cursor-not-allowed" 
                      : "bg-[#024E82] hover:bg-blue-800 shadow-md hover:shadow-lg"
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </motion.div>

              {/* Divider */}
              <motion.div variants={itemVariants} className="flex items-center my-6">
                <div className="flex-grow h-px bg-gray-200"></div>
                <span className="px-4 text-sm text-gray-500">or continue with</span>
                <div className="flex-grow h-px bg-gray-200"></div>
              </motion.div>

              {/* Social Login */}
              <motion.div variants={itemVariants}>
                <button
                  type="button"
                  className="w-full py-3 px-4 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <FcGoogle className="w-5 h-5 mr-2" />
                  Sign in with Google
                </button>
              </motion.div>

              {/* Sign Up Link */}
              <motion.div variants={itemVariants} className="text-center mt-8">
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-[#024E82] font-medium hover:text-blue-700 transition-colors">
                    Create an account
                  </Link>
                </p>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </div>

      {showPopup && (
        <Popup message={popupMessage} onClose={closePopup} />
      )}
    </>
  );
}
