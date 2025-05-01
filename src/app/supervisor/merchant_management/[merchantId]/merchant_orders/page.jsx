"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation"; // Correct hook for dynamic routing

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const MerchantOrders = ({ params }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingOrderId, setEditingOrderId] = useState(null); // Track the order being edited
  const [updatedStatus, setUpdatedStatus] = useState(""); // Track the updated status

  // Filter states
  const [statusFilter, setStatusFilter] = useState(""); // Filter by order track status
  const [sortOrder, setSortOrder] = useState("desc"); // Sorting by newest or oldest

  const router = useRouter(); // Initialize the router

  // Fetch orders using params.merchantId
  const fetchOrders = async () => {
    try {
      setLoading(true);

      // Get the token from localStorage
      const token = localStorage.getItem("supervisorToken");
      if (!token) {
        router.push("/supervisor/login"); // Redirect if no token is found
        return;
      }

      // Make API call with merchantId from params
      const response = await axios.get(
        `${apiBaseUrl}/sup/merchant_orders/${params.merchantId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update state with orders
      setOrders(response.data.orders);
    } catch (err) {
      setError(err.message || "Failed to fetch orders");
      if (err.response && err.response.status === 401) {
        router.push("/supervisor/login"); // Redirect on Unauthorized (401)
      }
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and sorting
  const filteredOrders = () => {
    let filteredData = [...orders];

    // Filter by status
    if (statusFilter) {
      filteredData = filteredData.filter(order => order.order_track_status === statusFilter);
    }

    // Sort orders by date
    filteredData = filteredData.sort((a, b) => {
      const dateA = new Date(a.CreatedAt);
      const dateB = new Date(b.CreatedAt);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    return filteredData;
  };

  useEffect(() => {
    fetchOrders();
  }, [params.merchantId]); // Re-fetch orders when merchantId changes

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen">{error}</div>;
  }
  return (
    <div className="container mx-auto py-6 bg-blue-50 min-h-screen px-6">
      <h1 className="text-3xl font-semibold mb-6 text-blue-800 border-b border-blue-200 pb-2">
        Orders for Merchant {params.merchantId}
      </h1>
      {loading && <p className="text-blue-600 flex items-center"><span className="animate-spin mr-2 h-5 w-5 border-b-2 border-blue-600 rounded-full"></span>Loading orders...</p>}
      {error && <p className="text-red-500 bg-red-50 p-4 rounded-lg border border-red-200">{error}</p>}

      {/* Filter Section */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-md border border-blue-100">
        <h2 className="text-lg font-semibold mb-3 text-blue-800">Filter Orders</h2>
        <div className="flex flex-wrap gap-4">
          {/* Order Track Status Filter */}
          <div className="flex flex-col">
            <label className="text-sm text-blue-700 mb-1 font-medium">Order Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-blue-200 p-2 rounded text-blue-700 bg-blue-50 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Shipping">Shipping</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>

          {/* Sort Order Filter */}
          <div className="flex flex-col">
            <label className="text-sm text-blue-700 mb-1 font-medium">Sort By</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="border border-blue-200 p-2 rounded text-blue-700 bg-blue-50 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              <option value="desc">Newest to Oldest</option>
              <option value="asc">Oldest to Newest</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="flex flex-col justify-end">
            <button
              onClick={() => {
                setStatusFilter("");
                setSortOrder("desc");
              }}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors shadow-md"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {!loading && !error && (
        <div className="overflow-x-auto custom-scrollbar bg-white rounded-lg shadow-md border border-blue-100">
          <table className="w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="py-3 px-6 text-left font-semibold">ID</th>
                <th className="py-3 px-6 text-left font-semibold">Created At</th>
                <th className="py-3 px-6 text-left font-semibold">Order ID</th>
                <th className="py-3 px-6 text-left font-semibold">Invoice ID</th>
                <th className="py-3 px-6 text-left font-semibold">Payment ID</th>
                <th className="py-3 px-6 text-left font-semibold">Payment Status</th>
                <th className="py-3 px-6 text-left font-semibold">Payment Method</th>
                <th className="py-3 px-6 text-left font-semibold" style={{ width: "200px" }}>Products Ordered</th>
                <th className="py-3 px-6 text-left font-semibold">Merchant ID</th>
                <th className="py-3 px-6 text-left font-semibold">User ID</th>
                <th className="py-3 px-6 text-left font-semibold">Shipping Address</th>
                <th className="py-3 px-6 text-left font-semibold">Order Track Status</th>
                <th className="py-3 px-6 text-left font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders().map((order) => (
                <tr key={order.ID} className="hover:bg-blue-50 transition-all duration-200 border-b border-blue-100">
                  <td className="py-3 px-4 truncate">{order.ID}</td>
                  <td className="py-3 px-4 truncate">
                    {new Date(order.CreatedAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 truncate">{order.order_id}</td>
                  <td className="py-3 px-4 truncate">{order.invoice_id}</td>
                  <td className="py-3 px-4 truncate">{order.payment_id}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.payment_status === 'Paid' ? 'bg-green-100 text-green-800' : 
                      order.payment_status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 truncate">{order.payment_method}</td>
                  <td className="py-3 px-4 truncate">{order.product_id}</td>
                  <td className="py-3 px-4 truncate">{order.merchant_id}</td>
                  <td className="py-3 px-4 truncate">{order.user_id}</td>
                  <td className="py-3 px-4 truncate">{order.shipping_address}</td>
                  <td className="py-3 px-4">
                    {editingOrderId === order.order_id ? (
                      <select
                        value={updatedStatus}
                        onChange={(e) => setUpdatedStatus(e.target.value)}
                        className="border p-1 rounded bg-blue-50 text-blue-700 border-blue-200"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Shipping">Shipping</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.order_track_status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                        order.order_track_status === 'Shipping' ? 'bg-blue-100 text-blue-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.order_track_status}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 truncate font-semibold">${order.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MerchantOrders;
