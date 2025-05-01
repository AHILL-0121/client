"use client";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
import Popup from "@/component/Landing_Page/CheckoutPage/Popup";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const MerchantsTable = () => {
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const closePopup = () => {
    setShowPopup(false);
  };
  const [merchants, setMerchants] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch all merchants
  const fetchAllMerchants = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("supervisorToken");
      const response = await axios.get(`${apiBaseUrl}/sup/merchants`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMerchants(Array.isArray(response.data.merchants) ? response.data.merchants : []);
    } catch (error) {
      console.error("Error fetching merchants:", error);
      if (error.response && error.response.status === 401) {
        router.push("/supervisor/login");
      } else {
        setPopupMessage("Failed to fetch merchants.");
        setShowPopup(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch on page load
  useEffect(() => {
    fetchAllMerchants();
  }, []);

  // Handle the search functionality
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchAllMerchants();
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("supervisorToken");
      const response = await axios.get(
        `${apiBaseUrl}/sup/searchmerchantbyname?name=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMerchants(Array.isArray(response.data.merchants) ? response.data.merchants : []);
    } catch (error) {
      console.error("Error searching merchants:", error);
      if (error.response && error.response.status === 401) {
        router.push("/supervisor/login");
      } else {
        setPopupMessage("Failed to search merchants.");
        setShowPopup(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reset functionality
  const handleReset = () => {
    setSearchQuery("");
    fetchAllMerchants();
  };

  // Handle view merchant details
  const handleView = (merchantId) => {
    router.push(`/supervisor/merchant_management/${merchantId}`);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-blue-900">Merchant Management</h1>
            <p className="text-gray-500 text-sm mt-1">View and manage all merchant accounts</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
              {merchants.length} Merchants
            </span>
          </div>
        </div>

        {/* Search and Reset functionality */}
        <div className="mb-6 bg-blue-50 p-4 rounded-lg">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search merchants by name"
                className="pl-10 pr-4 py-2 w-full border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              Search
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Reset
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merchant ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {merchants && merchants.length > 0 ? (
                  merchants.map((merchant) => (
                    <tr key={merchant.ID} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{merchant.ID}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{merchant.merchant_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{merchant.merchant_name || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{merchant.merchant_email || "N/A"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{merchant.merchant_phone || "N/A"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors inline-flex items-center"
                          onClick={() => handleView(merchant.merchant_id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2h2m3-4H9a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-1m-1 4l-3 3m0 0l-3-3m3 3V3" />
                        </svg>
                        <p className="text-lg font-medium">No merchants found</p>
                        <p className="text-sm text-gray-400">{searchQuery ? "Try a different search term or reset filters" : "There are no merchants in the system yet"}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {showPopup && (
        <Popup message={popupMessage} onClose={closePopup} />
      )}
    </>
  );
};

export default MerchantsTable;
