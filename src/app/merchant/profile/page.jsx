"use client";

import React, { useState, useEffect } from "react";
import ProfileForm from "../components/ProfileForm";
import Popup from "@/component/Landing_Page/CheckoutPage/Popup";
import axios from "axios";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ProfilePage() {
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const token = localStorage.getItem("merctoken");
        if (!token) {
          window.location.href = "/merchant/login";
          return;
        }

        const response = await axios.get(`${apiBaseUrl}/merchantdetails`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.error === "pending") {
          window.location.href = "/merchant/pending";
          return;
        }

        if (response.data.error === "on hold") {
          window.location.href = "/merchant/hold";
          return;
        }
      } catch (error) {
        if (error.response) {
          if (error.response.status === 401) {
            window.location.href = "/merchant/login";
          } else if (error.response.status === 403 && error.response.data.error === "pending") {
            window.location.href = "/merchant/pending";
          } else if (error.response.status === 403 && error.response.data.error === "on hold") {
            window.location.href = "/merchant/hold";
          }
        }
      }
    };

    checkStatus();
  }, []);

  const closePopup = () => {
    setShowPopup(false);
  };

  const [profile, setProfile] = useState({
    name: "John Merchant",
    email: "john@example.com",
    businessName: "John's Fashion Store",
  });

  const handleUpdateProfile = (updatedProfile) => {
    setProfile(updatedProfile);
    setPopupMessage("Profile updated successfully!");
    setShowPopup(true);
  };

  const handleChangePassword = (passwordData) => {
    console.log("Password Change Request:", passwordData);
    setPopupMessage("Password updated successfully!");
    setShowPopup(true);
  };

  // Format date with leading zeros for consistent rendering
  const formatDate = (date) => {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Profile Settings</h1>
              <p className="text-gray-500 mt-1">Manage your merchant account details</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(new Date())}
                  </p>
                </div>
                <div className="h-10 w-px bg-gray-200"></div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Account Status</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <ProfileForm initialProfile={profile} onUpdateProfile={handleUpdateProfile} />
          </div>
        </div>

        {/* Popup */}
        {showPopup && (
          <Popup message={popupMessage} onClose={closePopup} />
        )}
      </div>
    </div>
  );
}
