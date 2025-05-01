"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import OrderTable from "../components/OrderTable";
import OrderDetailsModal from "../components/OrderDetailsModal";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function OrderManagementPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    dateRange: "",
    search: "",
  });

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem("merctoken");
      if (!token) {
        router.push("/merchant/login");
        return;
      }

      const queryParams = new URLSearchParams(
        Object.entries(filters).reduce((acc, [key, value]) => {
          if (value) acc[key] = value;
          return acc;
        }, {})
      ).toString();

      const response = await axios.get(
        `${apiBaseUrl}/merchantorders${queryParams ? `?${queryParams}` : ""}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.error === "pending") {
        router.push("/merchant/pending");
        return;
      }

      if (response.data.error === "on hold") {
        router.push("/merchant/hold");
        return;
      }

      // Extract the orders array from the response
      const ordersData = response.data.orders || response.data;
      console.log("Orders received:", ordersData);
      
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (error.response?.status === 401) {
        router.push("/merchant/login");
      } else if (error.response?.status === 403 && error.response?.data.error === "pending") {
        router.push("/merchant/pending");
      } else if (error.response?.status === 403 && error.response?.data.error === "on hold") {
        router.push("/merchant/hold");
      } else {
        setError("Failed to load orders. Please try again later.");
      }
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const handleUpdateStatus = async (id, newStatus, cancellationReason = null) => {
    try {
      const token = localStorage.getItem("merctoken");
      if (!token) {
        router.push("/merchant/login");
        return;
      }

      console.log("Updating order status:", id, newStatus);
      
      let response;
      
      if (newStatus === "Cancelled" && cancellationReason) {
        // Call the cancellation endpoint
        response = await axios.post(
          `${apiBaseUrl}/merchant/orders/${id}/cancel`,
          { reason: cancellationReason },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        // After successful cancellation, also update the status explicitly
        if (response.status === 200) {
          await axios.put(
            `${apiBaseUrl}/merchantorders/${id}`,
            { order_track_status: "Cancelled" },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        }
      } else {
        // Normal status update
        response = await axios.put(
          `${apiBaseUrl}/merchantorders/${id}`,
          { order_track_status: newStatus },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      if (response.data.error === "on hold") {
        router.push("/merchant/hold");
        return;
      }

      if (response.status === 200) {
        console.log("Order status updated successfully:", response.data);
        setOrders(prevOrders => 
          Array.isArray(prevOrders) 
            ? prevOrders.map((order) =>
                order.order_id === id ? { 
                  ...order, 
                  order_track_status: newStatus,
                  ...(newStatus === "Cancelled" ? { 
                    cancelled_by: "Merchant",
                    cancellation_reason: cancellationReason 
                  } : {})
                } : order
              )
            : []
        );
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      console.error("Error response:", error.response?.data);
      if (error.response?.status === 401) {
        router.push("/merchant/login");
      } else if (error.response?.status === 403 && error.response?.data.error === "on hold") {
        router.push("/merchant/hold");
      }
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...newFilters }));
  };

  const getOrderCountByStatus = (status) => {
    return Array.isArray(orders) ? orders.filter(order => order.order_track_status === status).length : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
              <p className="text-gray-500 mt-1">Manage and track your orders</p>
              
              <div className="mt-4 flex items-center gap-8">
                <div>
                  <p className="text-gray-500 text-sm">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-800">{Array.isArray(orders) ? orders.length : 0}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Pending Orders</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {getOrderCountByStatus("pending")}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Completed Orders</p>
                  <p className="text-2xl font-bold text-green-600">
                    {getOrderCountByStatus("completed")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange({ status: e.target.value })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange({ dateRange: e.target.value })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
                placeholder="Search by order ID or customer name..."
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-4">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <p className="text-lg font-semibold text-gray-700">{error}</p>
              <button
                onClick={fetchOrders}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-4">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <p className="text-lg font-semibold text-gray-700">No orders found</p>
              <p className="text-gray-500 mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <OrderTable
              orders={orders}
              onUpdateStatus={handleUpdateStatus}
              onViewDetails={handleViewDetails}
            />
          )}
        </div>

        {/* Order Details Modal */}
        <OrderDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          order={selectedOrder}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>
    </div>
  );
}
