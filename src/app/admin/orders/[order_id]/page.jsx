"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const OrderDetails = ({ params }) => {
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem("adminToken"); // Retrieve token from localStorage
        const response = await axios.get(
          `${apiBaseUrl}/viewmerchantorder/${params.order_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include token in Authorization header
            },
          }
        );
        setOrderDetails(response.data.order);
      } catch (error) {
        console.error("Error fetching order details:", error);
        if (error.response && error.response.status === 401) {
          router.push("/admin/login"); // Redirect to login on unauthorized error
        } else {
          setErrorMessage("Failed to fetch order details.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [params.order_id, router]);

  // Get status color based on order status
  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-700";
    
    switch(status.toLowerCase()) {
      case 'pending':
        return "bg-yellow-100 text-yellow-800";
      case 'processing':
        return "bg-blue-100 text-blue-800";
      case 'shipping':
        return "bg-indigo-100 text-indigo-800";
      case 'delivered':
        return "bg-green-100 text-green-800";
      case 'cancelled':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Format date properly
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-700 flex items-start">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span>{errorMessage}</span>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md text-yellow-700">
        No details found for the order.
      </div>
    );
  }

  // Split the product_id string into individual products
  const productList = orderDetails.product_id.split(';');

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header with Order ID and Status */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Order #{orderDetails.order_id}</h1>
          <p className="text-gray-500 text-sm">{formatDate(orderDetails.CreatedAt)}</p>
        </div>
        <div className="mt-2 sm:mt-0">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(orderDetails.order_track_status)}`}>
            {orderDetails.order_track_status || "Unknown Status"}
          </span>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Order Information */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-800 mb-3 pb-2 border-b border-blue-100">Order Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-medium">{orderDetails.order_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{formatDate(orderDetails.CreatedAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(orderDetails.order_track_status)}`}>
                {orderDetails.order_track_status || "Unknown"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-bold text-blue-900">₹{orderDetails.total || '0.00'}</span>
            </div>
          </div>
        </div>

        {/* Shipping Information */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-800 mb-3 pb-2 border-b border-blue-100">Shipping Information</h2>
          <div className="space-y-3">
            <div>
              <span className="text-gray-600 block mb-1">Shipping Address:</span>
              <span className="font-medium block p-2 bg-white rounded border border-blue-100">
                {orderDetails.shipping_address || "No address provided"}
              </span>
            </div>
            {orderDetails.tracking_number && (
              <div className="flex justify-between">
                <span className="text-gray-600">Tracking Number:</span>
                <span className="font-medium">{orderDetails.tracking_number}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-blue-800 mb-3 pb-2 border-b border-gray-200">Products</h2>
        <div className="overflow-hidden border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product ID
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productList.map((product, index) => (
                <tr key={index} className="hover:bg-blue-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.trim() || "Unknown Product"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button 
          onClick={() => router.back()}
          className="px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
        >
          Back to Orders
        </button>
      </div>
    </div>
  );
};

export default OrderDetails;
