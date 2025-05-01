"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from 'next/link';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const MerchantOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [updatedStatus, setUpdatedStatus] = useState("");
  const [cancelingOrderId, setCancelingOrderId] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");

  const router = useRouter();

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("supervisorToken");
      if (!token) {
        router.push("/supervisor/login");
        return;
      }

      const response = await axios.get(`${apiBaseUrl}/sup/allorders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(response.data.orders || []);
      setError(null);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        router.push("/supervisor/login");
      } else {
        setError(err.message || "Failed to fetch orders");
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = () => {
    if (!Array.isArray(orders)) return [];
    
    let filteredData = [...orders];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredData = filteredData.filter(
        order => 
          (order.order_id && order.order_id.toLowerCase().includes(searchLower)) ||
          (order.invoice_id && order.invoice_id.toLowerCase().includes(searchLower)) ||
          (order.payment_id && order.payment_id.toLowerCase().includes(searchLower))
      );
    }

    // Apply status filter
    if (statusFilter) {
      filteredData = filteredData.filter(
        (order) => order.order_track_status === statusFilter
      );
    }

    // Apply sorting
    filteredData = filteredData.sort((a, b) => {
      const dateA = new Date(a.CreatedAt);
      const dateB = new Date(b.CreatedAt);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    return filteredData;
  };

  const handleEditClick = (orderId, currentStatus) => {
    setEditingOrderId(orderId);
    setUpdatedStatus(currentStatus);
  };

  const handleCancelClick = () => {
    setEditingOrderId(null);
    setUpdatedStatus("");
  };

  const handleSaveClick = async (orderId) => {
    try {
      const token = localStorage.getItem("supervisorToken");
      if (!token) {
        router.push("/supervisor/login");
        return;
      }

      setLoading(true);
      await axios.put(
        `${apiBaseUrl}/sup/adminmerchantorders/${orderId}`,
        {
          order_track_status: updatedStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the local state to reflect the change
      const updatedOrders = orders.map((order) =>
        order.order_id === orderId
          ? { ...order, order_track_status: updatedStatus }
          : order
      );
      setOrders(updatedOrders);

      // Reset editing state
      setEditingOrderId(null);
      setUpdatedStatus("");
      
      // Show success message (could be implemented with a toast notification)
    } catch (error) {
      setError(error.message || "Failed to update order status");
      if (error.response && error.response.status === 401) {
        router.push("/supervisor/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrderClick = (orderId) => {
    setCancelingOrderId(orderId);
    setCancellationReason("");
  };

  const handleCancelOrder = async () => {
    // Don't proceed if no reason is provided
    if (!cancellationReason.trim()) {
      return;
    }
    
    try {
      const token = localStorage.getItem("supervisorToken");
      if (!token) {
        router.push("/supervisor/login");
        return;
      }

      setLoading(true);
      await axios.post(
        `${apiBaseUrl}/admin/orders/${cancelingOrderId}/cancel`,
        { reason: cancellationReason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the local state to reflect the cancellation
      const updatedOrders = orders.map((order) =>
        order.order_id === cancelingOrderId
          ? {
              ...order,
              cancelled_by: "Admin",
              cancellation_reason: cancellationReason,
              order_track_status: "Cancelled"
            }
          : order
      );
      setOrders(updatedOrders);

      // Reset cancellation state
      setCancelingOrderId(null);
      setCancellationReason("");
      
      // Show success message (could be implemented with a toast notification)
    } catch (err) {
      setError(err.message || "Failed to cancel the order");
      if (err.response && err.response.status === 401) {
        router.push("/supervisor/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelProcess = () => {
    setCancelingOrderId(null);
    setCancellationReason("");
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Calculate statistics
  const orderStats = {
    total: Array.isArray(orders) ? orders.length : 0,
    pending: Array.isArray(orders) ? orders.filter(order => order.order_track_status === "Pending").length : 0,
    shipping: Array.isArray(orders) ? orders.filter(order => order.order_track_status === "Shipping").length : 0,
    delivered: Array.isArray(orders) ? orders.filter(order => order.order_track_status === "Delivered").length : 0,
    cancelled: Array.isArray(orders) ? orders.filter(order => order.cancelled_by).length : 0
  };

  // Loading state UI
  if (loading && (!Array.isArray(orders) || orders.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-lg font-medium text-gray-700">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Management</h1>
          <p className="text-gray-600">Manage and track all customer orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
            <p className="text-sm font-medium text-gray-500">Total Orders</p>
            <p className="text-2xl font-bold text-gray-800">{orderStats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
            <p className="text-sm font-medium text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-gray-800">{orderStats.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
            <p className="text-sm font-medium text-gray-500">Shipping</p>
            <p className="text-2xl font-bold text-gray-800">{orderStats.shipping}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
            <p className="text-sm font-medium text-gray-500">Delivered</p>
            <p className="text-2xl font-bold text-gray-800">{orderStats.delivered}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
            <p className="text-sm font-medium text-gray-500">Cancelled</p>
            <p className="text-2xl font-bold text-gray-800">{orderStats.cancelled}</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-md p-5 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-2xl">
              {/* Search Bar */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search by Order ID, Invoice ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute left-3 top-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Status Filter */}
              <div className="w-full sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Shipping">Shipping</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>

              {/* Sort Order */}
              <div className="w-full sm:w-48">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="desc">Newest to Oldest</option>
                  <option value="asc">Oldest to Newest</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setStatusFilter("");
                  setSortOrder("desc");
                  setSearchTerm("");
                }}
                className="flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Reset Filters
              </button>
              <button
                onClick={fetchOrders}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Table refresh indicator */}
        {loading && Array.isArray(orders) && orders.length > 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 flex items-center">
            <div className="w-5 h-5 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mr-3"></div>
            <p className="text-sm text-blue-700">Refreshing orders...</p>
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            {Array.isArray(filteredOrders()) && filteredOrders().length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders().map((order) => (
                    <tr key={order.ID} className="hover:bg-gray-50 transition-all duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600">{order.order_id}</div>
                        <div className="text-xs text-gray-500">ID: {order.ID}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(order.CreatedAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(order.CreatedAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.invoice_id || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.payment_id || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="max-w-xs truncate">{order.shipping_address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingOrderId === order.order_id ? (
                          <select
                            value={updatedStatus}
                            onChange={(e) => setUpdatedStatus(e.target.value)}
                            className="block w-full text-sm border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Shipping">Shipping</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.cancelled_by ? 'bg-red-100 text-red-800' : 
                            order.order_track_status === 'Delivered' ? 'bg-green-100 text-green-800' :
                            order.order_track_status === 'Shipping' ? 'bg-blue-100 text-blue-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.cancelled_by ? 'Cancelled' : order.order_track_status}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">₹{order.total}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {editingOrderId === order.order_id ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleSaveClick(order.order_id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelClick}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {!order.cancelled_by && (
                              <>
                                <button
                                  onClick={() => handleEditClick(order.order_id, order.order_track_status)}
                                  className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                  </svg>
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleCancelOrderClick(order.order_id)}
                                  className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                  Cancel
                                </button>
                                <Link href={`/supervisor/orders/${order.order_id}`}>
                                  <button
                                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                    View
                                  </button>
                                </Link>
                              </>
                            )}
                            {order.cancelled_by && (
                              <span className="text-xs text-red-600 italic">
                                Cancelled by: {order.cancelled_by}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 bg-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No orders found</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter 
                    ? "Try adjusting your filters to find what you're looking for." 
                    : "There are no orders to display at the moment."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Cancel Order Modal */}
        {cancelingOrderId && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Cancel Order</h2>
                <button 
                  onClick={handleCancelProcess}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="mb-6">
                <label htmlFor="cancellationReason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for cancellation
                </label>
                <textarea
                  id="cancellationReason"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Please provide a reason for cancelling this order..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  rows={4}
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelProcess}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={!cancellationReason.trim()}
                  className={`px-4 py-2 rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                    cancellationReason.trim() 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-red-300 cursor-not-allowed'
                  }`}
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MerchantOrdersPage;
