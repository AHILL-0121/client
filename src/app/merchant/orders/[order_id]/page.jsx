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
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const token = localStorage.getItem("merctoken");
        if (!token) {
          router.push("/merchant/login");
          return;
        }

        const response = await axios.get(
          `${apiBaseUrl}/merchantorder/${params.order_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOrderDetails(response.data.order);
      } catch (error) {
        console.error("Error fetching order details:", error);
        if (error.response?.status === 401) {
          router.push("/merchant/login");
        } else {
          setErrorMessage("Failed to fetch order details. Please try again later.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [params.order_id, router]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      setIsUpdating(true);
      const token = localStorage.getItem("merctoken");
      if (!token) {
        router.push("/merchant/login");
        return;
      }

      const response = await axios.put(
        `${apiBaseUrl}/merchantorder/${params.order_id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setOrderDetails(prev => ({
          ...prev,
          order_track_status: newStatus
        }));
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      if (error.response?.status === 401) {
        router.push("/merchant/login");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-lg font-semibold text-gray-700">{errorMessage}</p>
          <button
            onClick={() => router.push("/merchant/orders")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <p className="text-lg font-semibold text-gray-700">No order details found</p>
          <button
            onClick={() => router.push("/merchant/orders")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const productList = orderDetails.product_id.split(';');
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800"
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.push("/merchant/orders")}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Orders
          </button>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[orderDetails.order_track_status] || 'bg-gray-100 text-gray-800'}`}>
              {orderDetails.order_track_status}
            </span>
            <select
              value={orderDetails.order_track_status}
              onChange={(e) => handleStatusUpdate(e.target.value)}
              disabled={isUpdating}
              className={`rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                isUpdating ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Order #{orderDetails.order_id}</h1>
            <p className="text-gray-500 mt-1">
              Placed on {new Date(orderDetails.CreatedAt).toLocaleString()}
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
                <div className="space-y-2">
                  <p><span className="font-medium text-gray-700">Name:</span> {orderDetails.customer_name}</p>
                  <p><span className="font-medium text-gray-700">Email:</span> {orderDetails.customer_email}</p>
                  <p><span className="font-medium text-gray-700">Phone:</span> {orderDetails.customer_phone}</p>
                </div>
              </div>

              {/* Shipping Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h2>
                <div className="space-y-2">
                  <p><span className="font-medium text-gray-700">Address:</span> {orderDetails.shipping_address}</p>
                  <p><span className="font-medium text-gray-700">City:</span> {orderDetails.shipping_city}</p>
                  <p><span className="font-medium text-gray-700">State:</span> {orderDetails.shipping_state}</p>
                  <p><span className="font-medium text-gray-700">Pincode:</span> {orderDetails.shipping_pincode}</p>
                </div>
              </div>

              {/* Order Summary */}
              <div className="md:col-span-2">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">₹{orderDetails.subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">₹{orderDetails.shipping_cost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">₹{orderDetails.tax}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900">Total</span>
                        <span className="font-semibold text-gray-900">₹{orderDetails.total}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div className="md:col-span-2">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Products</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-4">
                    {productList.map((product, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                        <div>
                          <p className="font-medium text-gray-900">{product.trim()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
