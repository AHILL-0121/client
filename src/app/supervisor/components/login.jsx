"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Popup from "@/component/Landing_Page/CheckoutPage/Popup";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function LoginPage() {
  const [username, setUsername] = useState("");  // changed from email to username
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [popupMessage, setPopupMessage] = useState(""); // State to control popup message
  const [showPopup, setShowPopup] = useState(false); // State to control popup visibility
const closePopup = () => {
    setShowPopup(false);
};
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiBaseUrl}/sup/supervisor/login`, {
        username: username,  // send username instead of email
        password: password,
      });
      setPopupMessage("Login successful!");
        setShowPopup(true);
      localStorage.setItem("supervisorToken", response.data.supervisorToken); // Store the supervisor token with the correct key
      localStorage.removeItem("adminToken");
      router.push("/supervisor/overview"); // Redirect to the dashboard or another page
    } catch (error) {
      if (error.response) {
        // Check if the backend returns a specific error message for pending requests
        if (error.response.data.error === "pending") {
          setPopupMessage("Supervisor process in progress, please wait.");
          setShowPopup(true);
        } else {
          setPopupMessage("Invalid username or password");
        setShowPopup(true);
        }
      } else {
        console.error("An unexpected error occurred:", error);
        setPopupMessage("An error occurred. Please try again later.");
        setShowPopup(true);
      }
    }
  };

  return (
    <>
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center bg-blue-50 p-6 lg:p-16">
      {/* Left Side - Login Form */}
      <div className="bg-white shadow-lg rounded-lg p-10 lg:w-1/3 w-full mx-6 border border-blue-100">
        <div className="text-center mb-6">
          <img
            src="/navbar/LOGO_OUTFIT.svg"
            alt="Logo"
            className="w-16 h-16 mx-auto"
          />
        </div>
        <h2 className="text-2xl font-bold text-blue-800 text-center mb-4">
          Admin Supervisor Login
        </h2>
        <p className="text-blue-600 text-center mb-6">
          Enter your credentials to access your account
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm text-blue-700 mb-1 font-medium">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)} // Handle username change
              placeholder="Enter your username"
              className="w-full px-4 py-2 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none bg-blue-50"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm text-blue-700 mb-1 font-medium">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-2 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none bg-blue-50"
            />
            <a
              href="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-800 float-right mt-1 transition-colors"
            >
              Forgot password?
            </a>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition-colors shadow-md hover:shadow-lg"
          >
            Login
          </button>
          <div className="text-center mt-4">
           
          </div>
        </form>
      </div>

      {/* Right Side - Illustrations */}
      <div className="flex flex-col items-center justify-center lg:w-1/2 mt-10 lg:mt-0 lg:ml-12">
        <div className="w-80 lg:w-96 mb-8 rounded-lg overflow-hidden shadow-lg">
          <img
            src="/merchant/mer_login1.jpg"
            alt="Illustration 1"
            className="w-full hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="w-80 lg:w-96 rounded-lg overflow-hidden shadow-lg">
          <img
            src="/merchant/mer_login2.jpg"
            alt="Illustration 2"
            className="w-full hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
    </div>
    {showPopup && (
        <Popup message={popupMessage} onClose={closePopup} />
      )}
      </>
  );
}
