"use client";

import React, { useState } from "react";
import { X, Package, Truck, CreditCard, MapPin, Calendar, AlertCircle, CheckCircle, XCircle, Clock, TruckIcon, ShoppingBag } from "lucide-react";

const OrderDetailsModal = ({ isOpen, onClose, order, onUpdateStatus }) => {
  if (!isOpen || !order) return null;
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCancellationDialog, setShowCancellationDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return dateString;
    }
  };
  
  // Get status badge style
  const getStatusBadge = (status) => {
    const statusText = String(status || "").toLowerCase();
    
    if (statusText.includes("delivered") || statusText === "completed") {
      return {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: <CheckCircle className="w-5 h-5 mr-2" />,
        borderColor: "border-green-200"
      };
    } else if (statusText.includes("pending") || statusText === "processing") {
      return {
        bg: "bg-blue-100",
        text: "text-blue-800",
        icon: <Clock className="w-5 h-5 mr-2" />,
        borderColor: "border-blue-200"
      };
    } else if (statusText.includes("transit") || statusText.includes("shipping") || statusText.includes("shipped")) {
      return {
        bg: "bg-purple-100",
        text: "text-purple-800",
        icon: <TruckIcon className="w-5 h-5 mr-2" />,
        borderColor: "border-purple-200"
      };
    } else if (statusText.includes("cancelled") || statusText.includes("rejected")) {
      return {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: <XCircle className="w-5 h-5 mr-2" />,
        borderColor: "border-red-200"
      };
    } else if (statusText.includes("placed") || statusText.includes("confirmed")) {
      return {
        bg: "bg-indigo-100",
        text: "text-indigo-800",
        icon: <ShoppingBag className="w-5 h-5 mr-2" />,
        borderColor: "border-indigo-200"
      };
    } else {
      return {
        bg: "bg-gray-100",
        text: "text-gray-800",
        icon: <AlertCircle className="w-5 h-5 mr-2" />,
        borderColor: "border-gray-200"
      };
    }
  };
  
  const handleUpdateStatus = async (newStatus) => {
    if (!onUpdateStatus) return;
    
    // If cancelling, show the cancellation dialog first
    if (newStatus === "Cancelled") {
      setShowCancellationDialog(true);
      return;
    }
    
    setIsUpdating(true);
    try {
      console.log("Updating order status from modal:", order.order_id, newStatus);
      await onUpdateStatus(order.order_id, newStatus);
      
      // Update local order object to reflect change
      order.order_track_status = newStatus;
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleCancelOrder = async () => {
    if (!cancellationReason.trim()) {
      alert("Please provide a reason for cancellation");
      return;
    }
    
    setIsUpdating(true);
    try {
      console.log("Cancelling order with reason:", cancellationReason);
      await onUpdateStatus(order.order_id, "Cancelled", cancellationReason);
      
      // Update local order object to reflect change
      order.order_track_status = "Cancelled";
      order.cancellation_reason = cancellationReason;
      order.cancelled_by = "Merchant";
      
      // Close the dialog
      setShowCancellationDialog(false);
      setCancellationReason("");
    } catch (error) {
      console.error("Failed to cancel order:", error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const statusBadge = getStatusBadge(order.order_track_status);
  const createdAt = order.CreatedAt || order.created_at;
  const updatedAt = order.UpdatedAt || order.updated_at;
  
  // Parse product details from product_id (if it contains product details)
  const productDetails = order.product_id ? order.product_id.split(' - ') : [];
  let productName = productDetails[0] || "Product";
  let productSpecs = productDetails.slice(1).join(' - ');
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-fadeIn" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center">
            <div className="mr-4 p-2 rounded-full bg-indigo-100">
              <Package className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
              <p className="text-gray-500 text-sm">#{order.order_id}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Cancellation Dialog */}
        {showCancellationDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 animate-scaleIn" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <XCircle className="w-5 h-5 mr-2 text-red-500" />
                Cancel Order
              </h3>
              
              <p className="text-gray-600 mb-4">
                Please provide a reason for cancelling this order. This information will be shared with the customer.
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
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCancelOrder}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Processing...
                    </>
                  ) : (
                    "Confirm Cancellation"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="p-6">
          {/* Status Badge */}
          <div className={`flex items-center ${statusBadge.bg} ${statusBadge.text} p-3 rounded-lg border ${statusBadge.borderColor} mb-6`}>
            {statusBadge.icon}
            <span className="font-medium">
              Order is currently {order.order_track_status || "Processing"}
            </span>
          </div>
          
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Order Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                <Package className="w-5 h-5 mr-2 text-indigo-500" />
                Order Information
              </h3>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Order ID</p>
                  <p className="font-medium text-gray-800">{order.order_id}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Invoice ID</p>
                  <p className="font-medium text-gray-800">{order.invoice_id || "—"}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-start">
                  <Calendar className="w-5 h-5 text-indigo-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Order Date</p>
                    <p className="font-medium text-gray-800">{formatDate(createdAt)}</p>
                    {updatedAt && updatedAt !== createdAt && (
                      <p className="text-xs text-gray-500 mt-1">Last updated: {formatDate(updatedAt)}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Payment & Shipping */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-indigo-500" />
                Payment & Shipping
              </h3>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {order.payment_status || "Paid"}
                    </span>
                  </div>
                  <p className="font-medium text-gray-800 mt-1">{order.payment_method || "—"}</p>
                  <p className="text-xs text-gray-500 mt-1">Payment ID: {order.payment_id || "—"}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-start">
                  <MapPin className="w-5 h-5 text-indigo-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Shipping Address</p>
                    <p className="font-medium text-gray-800">{order.shipping_address || "—"}</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                  <p className="font-medium text-gray-800 text-lg">₹{order.total || "0.00"}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Products Section */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <ShoppingBag className="w-5 h-5 mr-2 text-indigo-500" />
              Products
            </h3>
            
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-200">
                <div className="p-4 flex items-center">
                  <div className="bg-gray-200 rounded-md w-16 h-16 flex items-center justify-center mr-4">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium text-gray-800">{productName}</h4>
                    {productSpecs && <p className="text-sm text-gray-500">{productSpecs}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Cancellation Section */}
          {(order.cancellation_reason || order.cancelled_by) && (
            <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-100">
              <h4 className="font-medium text-red-800 mb-2 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Cancellation Information
              </h4>
              {order.cancellation_reason && (
                <p className="text-sm text-red-700 mb-1"><strong>Reason:</strong> {order.cancellation_reason}</p>
              )}
              {order.cancelled_by && (
                <p className="text-sm text-red-700"><strong>Cancelled By:</strong> {order.cancelled_by}</p>
              )}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap gap-2 justify-end">
            {onUpdateStatus && order.order_track_status !== "Delivered" && order.order_track_status !== "Cancelled" && (
              <>
                {order.order_track_status === "Pending" && (
                  <button
                    onClick={() => handleUpdateStatus("Processing")}
                    disabled={isUpdating}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                  >
                    {isUpdating ? "Updating..." : (
                      <>
                        <Clock className="w-3.5 h-3.5 mr-1.5" />
                        Mark as Processing
                      </>
                    )}
                  </button>
                )}
                
                {(order.order_track_status === "Pending" || order.order_track_status === "Processing") && (
                  <button
                    onClick={() => handleUpdateStatus("Shipped")}
                    disabled={isUpdating}
                    className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center"
                  >
                    {isUpdating ? "Updating..." : (
                      <>
                        <Truck className="w-3.5 h-3.5 mr-1.5" />
                        Mark as Shipped
                      </>
                    )}
                  </button>
                )}
                
                <button
                  onClick={() => handleUpdateStatus("Cancelled")}
                  disabled={isUpdating}
                  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {isUpdating ? "Updating..." : (
                    <>
                      <XCircle className="w-3.5 h-3.5 mr-1.5" />
                      Cancel Order
                    </>
                  )}
                </button>
              </>
            )}
            
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
