"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Popup from "@/component/Landing_Page/CheckoutPage/Popup";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;


const ProfileForm = () => {
  const [popupMessage, setPopupMessage] = useState(""); // State to control popup message
  const [showPopup, setShowPopup] = useState(false); // State to control popup visibility
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

  const handleSubmit = async (e) => {
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
      setShowEditForm(false); // Hide the form after successful update
    } catch (error) {
      console.error("Error updating profile:", error);
      setPopupMessage("Failed to update profile.");
        setShowPopup(true);
    }
  };

  if (isLoading) {
    return <p>Loading profile...</p>;
  }

  return (
    <>
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-xl font-bold mb-4">Merchant Profile</h1>
      <p className="text-sm text-gray-600 mb-4">ID: {profile.merchant_id}</p>

      {!showEditForm && !showPasswordForm && (
        <>
          <div className="space-y-2">
            <p><strong>Name:</strong> {profile.merchant_name}</p>
            <p><strong>Email:</strong> {profile.merchant_email}</p>
            <p><strong>Phone:</strong> {profile.merchant_phone}</p>
            <p><strong>Address:</strong> {profile.merchant_address}</p>
            <p><strong>GSTIN:</strong> {profile.gstin}</p>
            <p><strong>Account No:</strong> {profile.account_no || "N/A"}</p>
            <p><strong>IFSC Code:</strong> {profile.ifsc_code || "N/A"}</p>
            <p><strong>Bank Name:</strong> {profile.bank_name || "N/A"}</p>
          </div>
          <div className="mt-4 space-x-4">
            <button
              onClick={() => setShowEditForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Edit Details
            </button>
            <button
              onClick={() => setShowPasswordForm(true)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Edit Password
            </button>
          </div>
        </>
      )}

      {showEditForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 mt-4"
        >
          <h3 className="text-lg font-bold">Update Details</h3>
          <div>
            <label className="block mb-1 text-gray-600">Name</label>
            <input
              type="text"
              name="merchant_name"
              value={profile.merchant_name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-600">Email</label>
            <input
              type="email"
              name="merchant_email"
              value={profile.merchant_email}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-600">Phone</label>
            <input
              type="text"
              name="merchant_phone"
              value={profile.merchant_phone}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-600">Address</label>
            <input
              type="text"
              name="merchant_address"
              value={profile.merchant_address}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-600">GSTIN</label>
            <input
              type="text"
              name="gstin"
              value={profile.gstin}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-600">Account No</label>
            <input
              type="text"
              name="account_no"
              value={profile.account_no}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-600">IFSC Code</label>
            <input
              type="text"
              name="ifsc_code"
              value={profile.ifsc_code}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-600">Bank Name</label>
            <input
              type="text"
              name="bank_name"
              value={profile.bank_name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="mt-4 space-x-4">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setShowEditForm(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {showPasswordForm && (
        <div className="mt-4">
          <h3 className="text-lg font-bold">Password Update Feature Coming Soon</h3>
          <button
            onClick={() => setShowPasswordForm(false)}
            className="mt-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Go Back
          </button>
        </div>
      )}
    </div>
    {showPopup && (
        <Popup message={popupMessage} onClose={closePopup} />
      )}

    </>
  );
};

export default ProfileForm;
