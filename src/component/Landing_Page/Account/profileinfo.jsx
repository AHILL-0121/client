"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiPhone, FiLock, FiEdit, FiLogOut, FiCheck, FiX } from "react-icons/fi";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function Profileinfo() {
  const [userDetails, setUserDetails] = useState({ username: "", email: "", number: "" });
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [editDetails, setEditDetails] = useState({ username: "", email: "", number: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [passwordData, setPasswordData] = useState({
    username: "",
    email: "",
    new_password: "",
  });

  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [isOtpCooldown, setIsOtpCooldown] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  // Fetch user details on mount
  useEffect(() => {
    const fetchUserDetails = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(`${apiBaseUrl}/userinfo`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserDetails(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching user details:", error);
        setMessage({ text: "Failed to load user information", type: "error" });
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  // Handle detail edit form submission
  const handleEditDetailsSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      await axios.put(`${apiBaseUrl}/useredit`, editDetails, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserDetails(editDetails);
      setIsEditingDetails(false);
      setMessage({ text: "Profile updated successfully!", type: "success" });
      setIsLoading(false);
    } catch (error) {
      console.error("Error updating user details:", error);
      setMessage({ text: "Failed to update profile", type: "error" });
      setIsLoading(false);
    }
  };

  // Handle password change form submission
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      await axios.put(`${apiBaseUrl}/userpass`, passwordData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setIsChangingPassword(false);
      setMessage({ text: "Password changed successfully!", type: "success" });
      setIsLoading(false);
    } catch (error) {
      console.error("Error changing password:", error);
      setMessage({ text: "Failed to change password", type: "error" });
      setIsLoading(false);
    }
  };

  // Send OTP API call
  const handleSendOTP = async () => {
    if (isOtpCooldown) {
      setOtpMessage(`Please wait ${otpTimer}s before requesting again.`);
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(`${apiBaseUrl}/send-otp`, {
        email: passwordData.email,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOtpMessage("OTP sent to your email. Please check.");
      startOtpCooldown();
      setIsLoading(false);
    } catch (error) {
      console.error("Error sending OTP:", error);
      setOtpMessage("Error sending OTP. Please try again.");
      setIsLoading(false);
    }
  };

  // Start OTP cooldown timer
  const startOtpCooldown = () => {
    setIsOtpCooldown(true);
    let timer = 30;
    setOtpTimer(timer);

    const interval = setInterval(() => {
      timer--;
      setOtpTimer(timer);
      if (timer === 0) {
        clearInterval(interval);
        setIsOtpCooldown(false);
        setOtpTimer(0);
      }
    }, 1000);
  };

  // Verify OTP API call
  const handleVerifyOTP = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(`${apiBaseUrl}/verify-otp`, {
        "email": userDetails.email,
        "code": otp,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOtpVerified(true);
      setOtpMessage("OTP verified successfully! You can now submit the password.");
      setIsLoading(false);
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setOtpMessage("Invalid OTP. Please try again.");
      setIsLoading(false);
    }
  };

  // Reset the forms and close the editing states
  const handleCancel = () => {
    setEditDetails({ username: "", email: "" });
    setPasswordData({ username: "", email: "", new_password: "" });
    setIsEditingDetails(false);
    setIsChangingPassword(false);
    setOtpVerified(false);
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    router.push("/");
  };

  // Clear message after 3 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Notification message */}
      {message.text && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`mb-4 p-3 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} flex items-center justify-between`}
        >
          <p>{message.text}</p>
          <button 
            onClick={() => setMessage({ text: "", type: "" })}
            className="text-gray-600 hover:text-gray-800"
          >
            <FiX />
          </button>
        </motion.div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <h2 className="text-2xl font-bold">Personal Information</h2>
        </div>

        {isLoading ? (
          <div className="p-6 flex justify-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Display user details */}
            <div className="p-6 space-y-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center p-3 rounded-md bg-gray-50"
              >
                <FiUser className="text-blue-500 mr-3 text-xl" />
                <div>
                  <p className="text-xs text-gray-500">Username</p>
                  <p className="font-medium">{userDetails.username}</p>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center p-3 rounded-md bg-gray-50"
              >
                <FiMail className="text-blue-500 mr-3 text-xl" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium">{userDetails.email}</p>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center p-3 rounded-md bg-gray-50"
              >
                <FiPhone className="text-blue-500 mr-3 text-xl" />
                <div>
                  <p className="text-xs text-gray-500">Phone Number</p>
                  <p className="font-medium">{userDetails.number}</p>
                </div>
              </motion.div>
            </div>

            {/* Action Buttons */}
            {!isEditingDetails && !isChangingPassword && (
              <div className="p-6 border-t border-gray-100 flex flex-wrap gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setEditDetails(userDetails);
                    setIsEditingDetails(true);
                    setIsChangingPassword(false);
                  }}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 transition-colors"
                >
                  <FiEdit className="mr-2" />
                  Edit Profile
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setPasswordData({
                      username: userDetails.username,
                      email: userDetails.email,
                      new_password: "",
                    });
                    setIsChangingPassword(true);
                    setIsEditingDetails(false);
                  }}
                  className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-md shadow-sm hover:bg-purple-600 transition-colors"
                >
                  <FiLock className="mr-2" />
                  Change Password
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md shadow-sm hover:bg-red-600 transition-colors"
                >
                  <FiLogOut className="mr-2" />
                  Logout
                </motion.button>
              </div>
            )}

            {/* Edit Details Form */}
            {isEditingDetails && (
              <motion.form 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleEditDetailsSubmit} 
                className="p-6 border-t border-gray-100"
              >
                <h3 className="text-lg font-semibold mb-4">Edit Your Profile</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Username</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={editDetails.username}
                        onChange={(e) => setEditDetails({ ...editDetails, username: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiPhone className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={editDetails.number}
                        onChange={(e) => setEditDetails({ ...editDetails, number: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mt-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 transition-colors"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      ) : (
                        <FiCheck className="mr-2" />
                      )}
                      Save Changes
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleCancel}
                      className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-md shadow-sm hover:bg-gray-600 transition-colors"
                      disabled={isLoading}
                    >
                      <FiX className="mr-2" />
                      Cancel
                    </motion.button>
                  </div>
                </div>
              </motion.form>
            )}

            {/* Change Password Form */}
            {isChangingPassword && (
              <motion.form 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleChangePasswordSubmit} 
                className="p-6 border-t border-gray-100"
              >
                <h3 className="text-lg font-semibold mb-4">Change Your Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Username</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={passwordData.username}
                        readOnly
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={passwordData.email}
                        readOnly
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* OTP Verification */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <h4 className="font-medium mb-2">OTP Verification</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      An OTP will be sent to your email for verification
                    </p>
                    
                    <div className="flex gap-2 mb-2">
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={isOtpCooldown || isLoading}
                        className={`px-4 py-2 rounded-md text-white ${isOtpCooldown ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
                      >
                        {isOtpCooldown ? `Resend OTP (${otpTimer}s)` : 'Send OTP'}
                      </button>
                    </div>
                    
                    {otpMessage && (
                      <p className={`text-sm ${otpVerified ? 'text-green-600' : 'text-red-600'} mb-2`}>
                        {otpMessage}
                      </p>
                    )}
                    
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter OTP"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOTP}
                        disabled={!otp || isLoading}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
                      >
                        Verify
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mt-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={!otpVerified || isLoading}
                      className={`flex items-center px-4 py-2 rounded-md shadow-sm ${!otpVerified ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'} transition-colors`}
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      ) : (
                        <FiCheck className="mr-2" />
                      )}
                      Change Password
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleCancel}
                      className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-md shadow-sm hover:bg-gray-600 transition-colors"
                      disabled={isLoading}
                    >
                      <FiX className="mr-2" />
                      Cancel
                    </motion.button>
                  </div>
                </div>
              </motion.form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
