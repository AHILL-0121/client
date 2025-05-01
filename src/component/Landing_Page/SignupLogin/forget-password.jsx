"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation"; // Import the useRouter hook
import Popup from "@/component/Landing_Page/CheckoutPage/Popup";
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // Step 1: Request OTP, Step 2: Verify OTP
  const router = useRouter(); // Initialize the router
  const [popupMessage, setPopupMessage] = useState(""); // State to control popup message
  const [showPopup, setShowPopup] = useState(false); // State to control popup visibility
const closePopup = () => {
    setShowPopup(false);
  };
  const handleSendOtp = async () => {
    try {
      const response = await axios.post(`${apiBaseUrl}/send-otp`, { email });
      setPopupMessage("OTP sent to your email. Please check your inbox.");
        setShowPopup(true);
      setStep(2);
    } catch (error) {
      setPopupMessage("Error sending OTP. Please ensure the email is correct.");
        setShowPopup(true);
      console.error(error);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await axios.post(`${apiBaseUrl}/verify-otp`, { email, code: otp });
      setPopupMessage("OTP verified! You can now reset your password.");
        setShowPopup(true);
      setStep(3);
    } catch (error) {
      setPopupMessage("Invalid OTP. Please try again.");
        setShowPopup(true);
      console.error(error);
    }
  };

  const handleChangePassword = async () => {
    try {
      await axios.put(`${apiBaseUrl}/useredit-pass`, {
        email, // Include the email in the request payload
        password: newPassword,
      });
      setPopupMessage("Password changed successfully!");
        setShowPopup(true);
      router.push("/login"); // Navigate to the login page
    } catch (error) {
      setPopupMessage("Error changing password. Please try again.");
        setShowPopup(true);
      console.error(error);
    }
  };

  return (
    <>
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Forgot Password</h1>
      {step === 1 && (
        <div className="w-full max-w-sm">
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300"
          />
          <button
            onClick={handleSendOtp}
            className="mt-4 w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Send OTP
          </button>
        </div>
      )}
      {step === 2 && (
        <div className="w-full max-w-sm">
          <label className="block text-sm font-medium mb-2">OTP</label>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300"
          />
          <button
            onClick={handleVerifyOtp}
            className="mt-4 w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Verify OTP
          </button>
        </div>
      )}
      {step === 3 && (
        <div className="w-full max-w-sm">
          <label className="block text-sm font-medium mb-2">New Password</label>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300"
          />
          <button
            onClick={handleChangePassword}
            className="mt-4 w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Change Password
          </button>
        </div>
      )}
    </div>
    {showPopup && (
        <Popup message={popupMessage} onClose={closePopup} />
      )}
    </>

  );
}
