"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Popup from "@/component/Landing_Page/CheckoutPage/Popup";
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const PendingMerchantsTable = () => {
  const [merchants, setMerchants] = useState([]);
  const router = useRouter();
  const [popupMessage, setPopupMessage] = useState(""); // State to control popup message
  const [showPopup, setShowPopup] = useState(false); // State to control popup visibility
const closePopup = () => {
    setShowPopup(false);
  };

  // Fetch pending merchants from the API
  const fetchPendingMerchants = async () => {
    try {
      const token = localStorage.getItem("supervisorToken"); // Retrieve token from localStorage
      const response = await axios.get(`${apiBaseUrl}/sup/pendingmerchants`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in Authorization header
        },
      });
      setMerchants(response.data.merchants || []);
    } catch (error) {
      console.error("Error fetching pending merchants:", error);
      if (error.response && error.response.status === 401) {
        router.push("/supervisor/login"); // Redirect to login on unauthorized error
      } else {
        setPopupMessage("Failed to fetch pending merchants.");
        setShowPopup(true);
      }
    }
  };

  useEffect(() => {
    fetchPendingMerchants();
  }, []);

  // Approve merchant API call
  const handleApprove = async (merchantId) => {
    try {
      const token = localStorage.getItem("supervisorToken"); // Retrieve token from localStorage
      await axios.put(`${apiBaseUrl}/sup/merchant/${merchantId}`, null, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in Authorization header
        },
      });
      setPopupMessage("Merchant approved successfully!");
        setShowPopup(true);
      fetchPendingMerchants(); // Refetch the data
    } catch (error) {
      console.error("Error approving merchant:", error);
      if (error.response && error.response.status === 401) {
        router.push("/supervisor/login"); // Redirect to login on unauthorized error
      } else {
        setPopupMessage("Failed to approve the merchant. Please try again.");
        setShowPopup(true);
      }
    }
  };

  return (
    <>
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Pending Merchants</h1>
      {merchants.length > 0 ? (
        <table className="table-auto w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">ID</th>
              <th className="border border-gray-300 px-4 py-2">Merchant ID</th>
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Email</th>
              <th className="border border-gray-300 px-4 py-2">Phone</th>
              <th className="border border-gray-300 px-4 py-2">Address</th>
              <th className="border border-gray-300 px-4 py-2">GSTIN</th>
              <th className="border border-gray-300 px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {merchants.map(merchant => (
              <tr key={merchant.ID} className="text-center">
                <td className="border border-gray-300 px-4 py-2">{merchant.ID}</td>
                <td className="border border-gray-300 px-4 py-2">{merchant.merchant_id}</td>
                <td className="border border-gray-300 px-4 py-2">{merchant.merchant_name || "N/A"}</td>
                <td className="border border-gray-300 px-4 py-2">{merchant.merchant_email || "N/A"}</td>
                <td className="border border-gray-300 px-4 py-2">{merchant.merchant_phone || "N/A"}</td>
                <td className="border border-gray-300 px-4 py-2">{merchant.merchant_address || "N/A"}</td>
                <td className="border border-gray-300 px-4 py-2">{merchant.gstin || "N/A"}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    onClick={() => handleApprove(merchant.merchant_id)}
                  >
                    Approve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-center text-gray-500">No pending merchant requests at the moment.</p>
      )}
    </div>
    {showPopup && (
      <Popup message={popupMessage} onClose={closePopup} />
    )}
    </>
  );
};

export default PendingMerchantsTable;
