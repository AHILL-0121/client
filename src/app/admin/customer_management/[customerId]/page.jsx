"use client"; // Mark this as a client-side component

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

const CustomerOrdersPage = ({ params }) => {
  const router = useRouter();
  const { customerId } = params; // Destructure customerId from params

  const [orders, setOrders] = useState([]);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("orders");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("adminToken");
        
        if (!token) {
          router.push("/admin/login");
          return;
        }

        // Fetch orders
        const ordersResponse = await axios.get(
          `${apiBaseUrl}/userorders_byid/${customerId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Attempt to fetch customer info (if endpoint exists)
        try {
          const customerResponse = await axios.get(
            `${apiBaseUrl}/searchuser?user_id=${customerId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          if (Array.isArray(customerResponse.data) && customerResponse.data.length > 0) {
            setCustomerInfo(customerResponse.data[0]);
          }
        } catch (customerError) {
          console.error("Error fetching customer details:", customerError);
          // Continue even if customer info fetch fails
        }

        setOrders(Array.isArray(ordersResponse.data) ? ordersResponse.data : []);
        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load customer data. Please try again.");

        if (error.response && error.response.status === 401) {
          router.push("/admin/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (customerId) {
      fetchData();
    }
  }, [customerId, router]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Shipping":
        return "bg-blue-100 text-blue-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getOrderTotal = () => {
    if (!Array.isArray(orders)) return 0;
    return orders.reduce((total, order) => total + parseFloat(order.total || 0), 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-lg font-medium text-gray-700">Loading customer data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => router.push("/admin/customer_management")}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
            >
              Go Back
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <button 
            onClick={() => router.push("/admin/customer_management")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Customers
          </button>
        </div>

        {/* Customer Profile */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {customerInfo?.username || `Customer ID: ${customerId}`}
                </h1>
                {customerInfo?.email && (
                  <p className="text-gray-600">{customerInfo.email}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col md:items-end">
              <div className="bg-blue-50 rounded-md px-4 py-2 text-center md:text-right">
                <span className="text-sm font-medium text-gray-600">Total Spent</span>
                <p className="text-2xl font-bold text-blue-600">₹{getOrderTotal().toFixed(2)}</p>
                <span className="text-sm font-medium text-gray-600">{orders.length} order(s)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("orders")}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === "orders"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setActiveTab("info")}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === "info"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Customer Info
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "orders" && (
              <>
                {orders.length > 0 ? (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div
                        key={order.order_id}
                        className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                              Order #{order.order_id}
                              <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(order.order_track_status)}`}>
                                {order.order_track_status}
                              </span>
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {new Date(order.CreatedAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                          <p className="text-lg font-bold text-blue-600 mt-2 sm:mt-0">
                            ₹{order.total}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Shipping Address</p>
                            <p className="text-sm text-gray-800 mt-1">{order.shipping_address || "Not provided"}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Payment</p>
                            <div className="flex flex-col mt-1">
                              <span className="text-sm text-gray-800">
                                Method: {order.payment_method || "Not specified"}
                              </span>
                              <span className="text-sm text-gray-800">
                                Status: <span className={order.payment_status === "Paid" ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                  {order.payment_status || "Unknown"}
                                </span>
                              </span>
                              {order.payment_id && (
                                <span className="text-sm text-gray-800">ID: {order.payment_id}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                          <p className="text-sm font-medium text-gray-500 mb-2">Products</p>
                          <div className="bg-gray-50 rounded-md p-3">
                            <ul className="divide-y divide-gray-200">
                              {order.product_name && order.product_name.split(';').map((product, index) => (
                                <li key={index} className="py-2 first:pt-0 last:pb-0">
                                  <div className="flex items-center">
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {product.trim()}
                                      </p>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="mt-2 text-xl font-medium text-gray-900">No orders found</h3>
                    <p className="mt-1 text-gray-500">This customer hasn't placed any orders yet.</p>
                  </div>
                )}
              </>
            )}

            {activeTab === "info" && (
              <div>
                {customerInfo ? (
                  <div className="bg-white rounded-lg overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Username</dt>
                            <dd className="mt-1 text-sm text-gray-900">{customerInfo.username}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                            <dd className="mt-1 text-sm text-gray-900">{customerInfo.email || "Not provided"}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">User ID</dt>
                            <dd className="mt-1 text-sm text-gray-900">{customerInfo.user_id}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Customer Since</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              {customerInfo.CreatedAt ? new Date(customerInfo.CreatedAt).toLocaleDateString() : "Unknown"}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-xl font-medium text-gray-900">Limited information available</h3>
                    <p className="mt-1 text-gray-500">Detailed customer information is not available.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrdersPage;
