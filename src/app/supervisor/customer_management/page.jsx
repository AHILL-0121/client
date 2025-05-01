"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Popup from "@/component/Landing_Page/CheckoutPage/Popup";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const CustomerManagement = () => {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [searchUsername, setSearchUsername] = useState("");
  const [searchUserID, setSearchUserID] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const closePopup = () => {
    setShowPopup(false);
  };

  // Fetch all customers
  const fetchAllCustomers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("supervisorToken");
      if (!token) {
        router.push("/supervisor/login");
        return;
      }
      
      const response = await axios.get(`${apiBaseUrl}/sup/getallusers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setCustomers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching customers:", error);
      if (error.response && error.response.status === 401) {
        router.push("/supervisor/login");
      }
      setPopupMessage("Failed to fetch customers. Please try again.");
      setShowPopup(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAllCustomers();
  }, []);

  // Handle search by username
  const handleSearchByUsername = async () => {
    if (!searchUsername.trim()) {
      setPopupMessage("Please enter a username to search.");
      setShowPopup(true);
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("supervisorToken");
      const response = await axios.get(
        `${apiBaseUrl}/sup/searchuser?username=${searchUsername.trim()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (Array.isArray(response.data) && response.data.length === 0) {
        setPopupMessage("No customers found with the given username.");
        setShowPopup(true);
      }
      
      setCustomers(response.data);
    } catch (error) {
      console.error("Error searching by username:", error);
      if (error.response && error.response.status === 401) {
        router.push("/supervisor/login");
      } else {
        setPopupMessage("No customers found with the given username.");
        setShowPopup(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search by user ID
  const handleSearchByUserID = async () => {
    if (!searchUserID.trim()) {
      setPopupMessage("Please enter a user ID to search.");
      setShowPopup(true);
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("supervisorToken");
      const response = await axios.get(
        `${apiBaseUrl}/sup/searchuser?user_id=${searchUserID.trim()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (Array.isArray(response.data) && response.data.length === 0) {
        setPopupMessage("No customers found with the given user ID.");
        setShowPopup(true);
      }
      
      setCustomers(response.data);
    } catch (error) {
      console.error("Error searching by user ID:", error);
      if (error.response && error.response.status === 401) {
        router.push("/supervisor/login");
      } else {
        setPopupMessage("No customers found with the given user ID.");
        setShowPopup(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reset
  const handleReset = () => {
    setSearchUsername("");
    setSearchUserID("");
    fetchAllCustomers();
  };

  // Handle deletion confirmation
  const confirmDelete = (user_id) => {
    setSelectedCustomerId(user_id);
    setShowConfirmModal(true);
  };

  // Handle delete customer
  const handleDeleteCustomer = async () => {
    if (!selectedCustomerId) return;
    
    try {
      setIsDeleting(true);
      const token = localStorage.getItem("supervisorToken");
      await axios.delete(`${apiBaseUrl}/sup/deleteuser/${selectedCustomerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setPopupMessage("Customer deleted successfully!");
      setShowPopup(true);
      setCustomers(customers.filter((customer) => customer.user_id !== selectedCustomerId));
      
      // Close the modal
      setShowConfirmModal(false);
      setSelectedCustomerId(null);
    } catch (error) {
      console.error("Error deleting customer:", error);
      if (error.response && error.response.status === 401) {
        router.push("/supervisor/login");
      } else {
        setPopupMessage("Failed to delete customer.");
        setShowPopup(true);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle view customer
  const handleViewCustomer = (user_id) => {
    router.push(`/supervisor/customer_management/${user_id}`);
  };

  const handleKeyDown = (e, searchFunction) => {
    if (e.key === 'Enter') {
      searchFunction();
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Customer Management</h1>
            <p className="text-gray-600">View and manage all customers in your system</p>
          </div>

          {/* Search Panel */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Search Customers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Search by Username */}
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Search by Username
                </label>
                <div className="flex">
                  <input
                    id="username"
                    type="text"
                    value={searchUsername}
                    onChange={(e) => setSearchUsername(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, handleSearchByUsername)}
                    placeholder="Enter username..."
                    className="flex-1 rounded-l-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={handleSearchByUsername}
                    className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Searching...
                      </span>
                    ) : "Search"}
                  </button>
                </div>
              </div>

              {/* Search by User ID */}
              <div className="space-y-2">
                <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                  Search by User ID
                </label>
                <div className="flex">
                  <input
                    id="userId"
                    type="text"
                    value={searchUserID}
                    onChange={(e) => setSearchUserID(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, handleSearchByUserID)}
                    placeholder="Enter user ID..."
                    className="flex-1 rounded-l-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={handleSearchByUserID}
                    className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Searching...
                      </span>
                    ) : "Search"}
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={handleReset}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Filters
              </button>
            </div>
          </div>

          {/* Customers Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {isLoading && customers.length === 0 ? (
              <div className="flex justify-center items-center py-20">
                <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600 border-t-transparent" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
                <span className="ml-4 text-gray-600">Loading customers...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.isArray(customers) && customers.length > 0 ? (
                      customers.map((customer) => (
                        <tr key={customer.user_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{customer.username}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{customer.email || "-"}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.user_id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleViewCustomer(customer.user_id)}
                              className="text-blue-600 hover:text-blue-900 mx-2"
                            >
                              View
                            </button>
                            <button
                              onClick={() => confirmDelete(customer.user_id)}
                              className="text-red-600 hover:text-red-900 mx-2"
                              disabled={isDeleting}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500">
                          <div className="flex flex-col items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <p className="text-base font-medium text-gray-900">No customers found</p>
                            <p className="text-gray-500 mt-1">
                              {searchUsername || searchUserID
                                ? "Try adjusting your search criteria"
                                : "No customers available in the system"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-sm text-gray-500 mb-5">
              Are you sure you want to delete this customer? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCustomer}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showPopup && (
        <Popup message={popupMessage} onClose={closePopup} />
      )}
    </>
  );
};

export default CustomerManagement;
