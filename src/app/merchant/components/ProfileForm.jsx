"use client";
import Popup from "@/component/Landing_Page/CheckoutPage/Popup";
import React, { useState, useEffect } from "react";
import axios from "axios";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const ProfileForm = () => {
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const closePopup = () => {
    setShowPopup(false);
  };

  const [profile, setProfile] = useState({
    merchant_name: "",
    merchant_email: "",
    merchant_phone: "",
    merchant_address: "",
    gstin: "",
    account_no: "",
    ifsc_code: "",
    bank_name: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({
    old_password: "",
    new_password: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("merctoken");
        const response = await axios.get(`${apiBaseUrl}/merchantdetails`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.error === "pending") {
          setPopupMessage("Your join request is still in process. Please wait for approval.");
          setShowPopup(true);
          return;
        }

        setProfile(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setPopupMessage("Failed to fetch profile details.");
        setShowPopup(true);
        if (error.response) {
          if (error.response.status === 401) {
            window.location.href = "/merchant/login";
          } else if (error.response.status === 403 && error.response.data.error === "pending") {
            window.location.href = "/merchant/pending";
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords({ ...passwords, [name]: value });
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("merctoken");
      const response = await axios.put(
        `${apiBaseUrl}/editmerchantdetails`,
        profile,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPopupMessage("Profile updated successfully!");
      setShowPopup(true);
      setShowEditForm(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setPopupMessage("Failed to update profile.");
      setShowPopup(true);
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("merctoken");
      const response = await axios.put(
        `${apiBaseUrl}/merchant-edit-password`,
        {
          old_password: passwords.old_password,
          new_password: passwords.new_password,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPopupMessage("Password updated successfully!");
      setShowPopup(true);
      setShowPasswordForm(false);
    } catch (error) {
      console.error("Error updating password:", error);
      setPopupMessage("Failed to update password.");
      setShowPopup(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {!showEditForm && !showPasswordForm && (
          <>
            {/* Profile Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="text-base font-medium text-gray-900">{profile.merchant_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-base font-medium text-gray-900">{profile.merchant_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-base font-medium text-gray-900">{profile.merchant_phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-base font-medium text-gray-900">{profile.merchant_address}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Business Information</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">GSTIN</p>
                    <p className="text-base font-medium text-gray-900">{profile.gstin}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Bank Account</p>
                    <p className="text-base font-medium text-gray-900">{profile.account_no || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">IFSC Code</p>
                    <p className="text-base font-medium text-gray-900">{profile.ifsc_code || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Bank Name</p>
                    <p className="text-base font-medium text-gray-900">{profile.bank_name || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                onClick={() => setShowPasswordForm(true)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Change Password
              </button>
              <button
                onClick={() => setShowEditForm(true)}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Edit Profile
              </button>
            </div>
          </>
        )}

        {/* Edit Profile Form */}
        {showEditForm && (
          <form onSubmit={handleSubmitProfile} className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Edit Profile</h3>
              <button
                type="button"
                onClick={() => setShowEditForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="merchant_name"
                  value={profile.merchant_name}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="merchant_email"
                  value={profile.merchant_email}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  name="merchant_phone"
                  value={profile.merchant_phone}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
                <input
                  type="text"
                  name="gstin"
                  value={profile.gstin}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  name="merchant_address"
                  value={profile.merchant_address}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <input
                  type="text"
                  name="account_no"
                  value={profile.account_no}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                <input
                  type="text"
                  name="ifsc_code"
                  value={profile.ifsc_code}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  name="bank_name"
                  value={profile.bank_name}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}

        {/* Change Password Form */}
        {showPasswordForm && (
          <form onSubmit={handleSubmitPassword} className="max-w-md mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Change Password</h3>
              <button
                type="button"
                onClick={() => setShowPasswordForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  name="old_password"
                  value={passwords.old_password}
                  onChange={handlePasswordChange}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  name="new_password"
                  value={passwords.new_password}
                  onChange={handlePasswordChange}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Update Password
              </button>
            </div>
          </form>
        )}
      </div>

      {showPopup && (
        <Popup message={popupMessage} onClose={closePopup} />
      )}
    </>
  );
};

export default ProfileForm;
