"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Popup from "@/component/Landing_Page/CheckoutPage/Popup";
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const MerchantInfo = ({ params }) => {
  const [popupMessage, setPopupMessage] = useState(""); // State to control popup message
  const [showPopup, setShowPopup] = useState(false); // State to control popup visibility
const closePopup = () => {
    setShowPopup(false);
  };
  const router = useRouter();
  const [merchantDetails, setMerchantDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMerchantDetails = async () => {
      try {
        const token = localStorage.getItem("supervisorToken"); // Retrieve token from localStorage
        const response = await axios.get(
          `${apiBaseUrl}/sup/merchant_management/${params.merchantId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include token in Authorization header
            },
          }
        );
        setMerchantDetails(response.data);
      } catch (error) {
        console.error("Error fetching merchant details:", error);
        if (error.response && error.response.status === 401) {
          router.push("/supervisor/login"); // Redirect to login on unauthorized error
        } else {
          setPopupMessage("Failed to fetch merchant details.");
        setShowPopup(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMerchantDetails();
  }, [params.merchantId, router]);

  const onDeleteMerchant = async () => {
    if (!confirm("Are you sure you want to delete this merchant? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("supervisorToken"); // Retrieve token from localStorage
      await axios.delete(`${apiBaseUrl}/sup/deleteMerchant/${params.merchantId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in Authorization header
        },
      });

      setPopupMessage("Merchant deleted successfully.");
        setShowPopup(true);
      router.push("/supervisor/merchant_management"); // Redirect back to merchant management page
    } catch (error) {
      console.error("Error deleting merchant:", error);
      if (error.response && error.response.status === 401) {
        router.push("/supervisor/login"); // Redirect to login on unauthorized error
      } else {
        setPopupMessage("Failed to delete merchant.");
        setShowPopup(true);
      }
    }
  };

  // Function to put merchant on hold
  const onHoldMerchant = async () => {
    if (!confirm("Are you sure you want to deactivate this merchant? All their products will also be deactivated.")) {
      return;
    }

    try {
      const token = localStorage.getItem("supervisorToken");
      await axios.put(
        `${apiBaseUrl}/sup/merchant_management/${params.merchantId}/hold`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPopupMessage("Merchant deactivated successfully.");
      setShowPopup(true);
      
      // Refresh merchant details
      setMerchantDetails({
        ...merchantDetails,
        hold: "unactive"
      });
    } catch (error) {
      console.error("Error deactivating merchant:", error);
      if (error.response && error.response.status === 401) {
        router.push("/supervisor/login");
      } else {
        setPopupMessage("Failed to deactivate merchant.");
        setShowPopup(true);
      }
    }
  };

  // Function to release merchant from hold
  const onReleaseMerchant = async () => {
    if (!confirm("Are you sure you want to activate this merchant? All their products will also be activated.")) {
      return;
    }

    try {
      const token = localStorage.getItem("supervisorToken");
      await axios.put(
        `${apiBaseUrl}/sup/merchant_management/${params.merchantId}/release`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPopupMessage("Merchant activated successfully.");
      setShowPopup(true);
      
      // Refresh merchant details
      setMerchantDetails({
        ...merchantDetails,
        hold: ""
      });
    } catch (error) {
      console.error("Error activating merchant:", error);
      if (error.response && error.response.status === 401) {
        router.push("/supervisor/login");
      } else {
        setPopupMessage("Failed to activate merchant.");
        setShowPopup(true);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!merchantDetails) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md text-yellow-700">
        No details found for the merchant.
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Header with merchant name and ID */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-blue-900">{merchantDetails.merchant_name || "Unknown Merchant"}</h1>
            <p className="text-gray-500 text-sm">Merchant ID: {merchantDetails.merchant_id}</p>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-col items-end">
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
              Merchant Account
            </span>
            {merchantDetails.hold === "unactive" && (
              <span className="mt-2 px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                Deactivated
              </span>
            )}
          </div>
        </div>

        {/* Main content - two columns on larger screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Contact Information */}
          <div className="bg-blue-50 p-5 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-800 mb-4 pb-2 border-b border-blue-100 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
              </svg>
              Contact Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-gray-600 w-24">Name:</span>
                <span className="font-medium">{merchantDetails.merchant_name || "N/A"}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 w-24">Email:</span>
                <span className="font-medium">{merchantDetails.merchant_email || "N/A"}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 w-24">Phone:</span>
                <span className="font-medium">{merchantDetails.merchant_phone || "N/A"}</span>
              </div>
              <div className="flex items-start">
                <span className="text-gray-600 w-24">Address:</span>
                <span className="font-medium">{merchantDetails.merchant_address || "N/A"}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 w-24">GSTIN:</span>
                <span className="font-medium">{merchantDetails.gstin || "N/A"}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 w-24">Last Login:</span>
                <span className="font-medium">
                  {merchantDetails.last_logged_in 
                    ? new Date(merchantDetails.last_logged_in).toLocaleString() 
                    : "Never"}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 w-24">Status:</span>
                <span className={`font-medium ${merchantDetails.hold === "unactive" ? "text-red-600" : "text-green-600"}`}>
                  {merchantDetails.hold === "unactive" ? "Deactivated" : "Active"}
                </span>
              </div>
            </div>
          </div>

          {/* Banking Information */}
          <div className="bg-blue-50 p-5 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-800 mb-4 pb-2 border-b border-blue-100 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
              Banking Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-gray-600 w-32">Bank Name:</span>
                <span className="font-medium">{merchantDetails.bank_name || "N/A"}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 w-32">Account Number:</span>
                <span className="font-medium">{merchantDetails.account_no || "N/A"}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 w-32">IFSC Code:</span>
                <span className="font-medium">{merchantDetails.ifsc_code || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
      
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-200">
          <button
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => router.push(`/admin/merchant_management/${params.merchantId}/merchant_inventory`)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
            </svg>
            View Inventory
          </button>
          <button
            className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            onClick={() => router.push(`/admin/merchant_management/${params.merchantId}/merchant_orders`)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
            </svg>
            View Orders
          </button>
          
          {/* Activate/Deactivate Button */}
          {merchantDetails.hold === "unactive" ? (
            <button
              className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              onClick={onReleaseMerchant}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Activate Merchant
            </button>
          ) : (
            <button
              className="flex items-center bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
              onClick={onHoldMerchant}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
              </svg>
              Deactivate Merchant
            </button>
          )}
          
          <button
            className="flex items-center bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors ml-auto"
            onClick={onDeleteMerchant}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Delete Merchant
          </button>
        </div>
      </div>
    
      {showPopup && (
        <Popup message={popupMessage} onClose={closePopup} />
      )}
    </>
  );
};

export default MerchantInfo;
