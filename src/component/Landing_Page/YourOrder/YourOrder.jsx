"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FiPackage, FiClock, FiCheck, FiX, FiAlertTriangle, FiRefreshCw, FiDollarSign, FiCreditCard, FiMapPin, FiShoppingBag } from "react-icons/fi";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [showCancellationDialog, setShowCancellationDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      console.error("No auth token found");
        setOrders([]);
        setIsLoading(false);
      return;
    }

      try {
        const response = await axios.get(`${apiBaseUrl}/getuserorder`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        });
        const fetchedOrders = Array.isArray(response.data) ? response.data : [];
        setOrders(fetchedOrders);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setMessage({ text: "Failed to load orders", type: "error" });
        setOrders([]);
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Clear message after 3 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1";
    
    switch (status) {
      case "Pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "Shipping":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "Delivered":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "Cancelled":
        return `${baseClasses} bg-gray-200 text-gray-600`;
      case "Refunded":
        return `${baseClasses} bg-indigo-100 text-indigo-800`;
      case "Refund in Process":
        return `${baseClasses} bg-purple-100 text-purple-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <FiClock />;
      case "Shipping":
        return <FiPackage />;
      case "Delivered":
        return <FiCheck />;
      case "Cancelled":
        return <FiX />;
      case "Refunded":
        return <FiDollarSign />;
      case "Refund in Process":
        return <FiRefreshCw />;
      default:
        return <FiAlertTriangle />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const toggleOrderExpand = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  const cancelOrder = async (orderId, e) => {
    e.stopPropagation(); // Prevent expanding the order card
    
    // Show the cancellation dialog instead of immediately cancelling
    setSelectedOrderId(orderId);
    setShowCancellationDialog(true);
  };
  
  const confirmCancelOrder = async () => {
    if (!cancellationReason.trim()) {
      setMessage({ text: "Please provide a reason for cancellation", type: "error" });
      return;
    }
    
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      console.error("No auth token found");
      setMessage({ text: "Authentication required", type: "error" });
      return;
    }

    setIsCancelling(true);
    try {
      await axios.post(
        `${apiBaseUrl}/orders/${selectedOrderId}/cancel`,
        { reason: cancellationReason },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.order_id === selectedOrderId
            ? { 
                ...order, 
                order_track_status: "Cancelled",
                cancelled_by: "Client",
                cancellation_reason: cancellationReason
              }
            : order
        )
      );
      setMessage({ text: "Order cancelled successfully", type: "success" });
      setIsCancelling(false);
      setShowCancellationDialog(false);
      setCancellationReason("");
      setSelectedOrderId(null);
    } catch (error) {
      console.error("Error canceling order:", error);
      setMessage({ text: "Failed to cancel order", type: "error" });
      setIsCancelling(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Notification message */}
      <AnimatePresence>
        {message.text && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-4 p-3 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} flex items-center justify-between`}
          >
            <p>{message.text}</p>
            <button 
              onClick={() => setMessage({ text: "", type: "" })}
              className="text-gray-600 hover:text-gray-800"
            >
              <FiX />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Cancellation Dialog */}
      {showCancellationDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FiX className="w-5 h-5 mr-2 text-red-500" />
              Cancel Order
            </h3>
            
            <p className="text-gray-600 mb-4">
              Please provide a reason for cancelling this order. This helps us improve our service.
            </p>
            
            <div className="mb-4">
              <label htmlFor="cancellationReason" className="block text-sm font-medium text-gray-700 mb-1">
                Cancellation Reason *
              </label>
              <textarea
                id="cancellationReason"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Enter reason for cancellation..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                rows={4}
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCancellationDialog(false);
                  setCancellationReason("");
                  setSelectedOrderId(null);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
                disabled={isCancelling}
              >
                Cancel
              </button>
              <button
                onClick={confirmCancelOrder}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FiX className="mr-2" />
                    Confirm Cancellation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">Your Orders</h1>
        <p className="text-gray-600 mt-2">Track, manage and review your orders</p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
      {Array.isArray(orders) && orders.length > 0 ? (
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-6"
            >
          {orders.map((order) => {
            // Determine the status to display
            let statusToDisplay = order.order_track_status;

            if (["Refund in Process", "Refunded"].includes(order.order_track_status)) {
              statusToDisplay = order.order_track_status; // Refund status overwrites
            } else if (order.cancelled_by) {
              statusToDisplay = "Cancelled"; // Cancelled by someone
            }

                const isExpanded = expandedOrder === order.order_id;

            return (
                  <motion.div
                key={order.order_id}
                    variants={item}
                    className={`bg-white border rounded-lg shadow-sm overflow-hidden transition-all duration-300 ${
                      isExpanded ? 'shadow-md' : 'hover:shadow-md'
                    }`}
                    onClick={() => toggleOrderExpand(order.order_id)}
              >
                    <div className="p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between">
                      <div className="mb-3 md:mb-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={getStatusBadge(statusToDisplay)}>
                            {getStatusIcon(statusToDisplay)}
                            <span>{statusToDisplay}</span>
                          </span>
                          <span className="text-xs text-gray-500">{formatDate(order.timestamp)}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mt-2">
                          Invoice: #{order.invoice_id}
                    </h3>
                      </div>
                      
                      <div className="flex flex-wrap gap-3 items-center">
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-800">₹{order.total}</div>
                          <div className="text-xs text-gray-500">
                            {order.payment_method} • {order.payment_status}
                          </div>
                        </div>
                        
                        <button 
                          className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleOrderExpand(order.order_id);
                          }}
                        >
                          <svg
                            className={`w-5 h-5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </button>
                      </div>
                  </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="p-5 border-t border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-3">Order Details</h4>
                                <ul className="space-y-2 text-sm">
                                  <li className="flex items-start">
                                    <span className="text-gray-600 font-medium w-28">Order ID:</span>
                                    <span className="text-gray-800">{order.order_id}</span>
                                  </li>
                                  <li className="flex items-start">
                                    <span className="text-gray-600 font-medium w-28">Payment ID:</span>
                                    <span className="text-gray-800">{order.payment_id}</span>
                                  </li>
                                  <li className="flex items-start">
                                    <span className="text-gray-600 font-medium w-28">Payment:</span>
                                    <span className={`font-semibold ${order.payment_status === "Paid" ? "text-green-600" : "text-red-600"}`}>
                        {order.payment_status}
                      </span>
                                  </li>
                                  <li className="flex items-start">
                                    <span className="text-gray-600 font-medium w-28">Method:</span>
                                    <span className="text-gray-800 flex items-center">
                                      <FiCreditCard className="mr-1" />
                                      {order.payment_method}
                                    </span>
                                  </li>
                                </ul>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-3">Shipping Details</h4>
                                <div className="flex items-start">
                                  <FiMapPin className="text-gray-400 mt-1 mr-2 flex-shrink-0" />
                                  <span className="text-sm text-gray-700">{order.shipping_address}</span>
                                </div>
                  </div>

                              <div className="md:col-span-2">
                                <h4 className="text-sm font-medium text-gray-500 mb-3">Products</h4>
                                <div className="bg-gray-50 p-3 rounded-md">
                      {order.product_id?.split(";").map((product, index) => (
                                    <div key={index} className="flex items-center py-2 border-b last:border-b-0 border-gray-200">
                                      <FiShoppingBag className="text-gray-400 mr-2" />
                                      <span className="text-sm text-gray-700">{product.trim()}</span>
                                    </div>
                      ))}
                                </div>
                              </div>
                              
                              {/* Cancellation Information */}
                              {order.cancelled_by && (
                                <div className="md:col-span-2 mt-4">
                                  <div className="bg-red-50 border border-red-100 rounded-md p-4">
                                    <h4 className="text-sm font-medium text-red-800 mb-2 flex items-center">
                                      <FiAlertTriangle className="mr-2" />
                                      Cancellation Information
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <p className="text-red-700">
                                        <span className="font-medium">Cancelled by:</span> {order.cancelled_by}
                                      </p>
                                      {order.cancellation_reason && (
                                        <p className="text-red-700">
                                          <span className="font-medium">Reason:</span> {order.cancellation_reason}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                  </div>

                  {/* Cancel Button */}
                            {["Pending", "Shipping"].includes(order.order_track_status) && !order.cancelled_by && (
                              <div className="mt-6 flex justify-end">
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={(e) => cancelOrder(order.order_id, e)}
                                  disabled={isCancelling}
                                  className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                                >
                                  {isCancelling ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                  ) : (
                                    <FiX className="mr-2" />
                                  )}
                          Cancel Order
                                </motion.button>
                              </div>
                      )}
                  </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-50 p-12 text-center rounded-lg border border-gray-200"
            >
              <div className="text-gray-400 mb-3">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">No orders found</h3>
              <p className="text-gray-500 mb-6">Looks like you haven't placed any orders yet</p>
              <a 
                href="/shop" 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-block"
              >
                Start Shopping
              </a>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
