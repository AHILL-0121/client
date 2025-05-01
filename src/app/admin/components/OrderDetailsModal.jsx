"use client";

import React from "react";

const OrderDetailsModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  // Format date if available
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    if (!order.items || !Array.isArray(order.items)) return 0;
    return order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Get status color
  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-800";
    
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
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
          <h2 className="text-xl font-bold">Order #{order.id}</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-blue-100 focus:outline-none"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Order Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-3 pb-2 border-b border-blue-200">Order Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{formatDate(order.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">{order.paymentMethod || "N/A"}</span>
                </div>
              </div>
            </div>
            
            {/* Customer Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-3 pb-2 border-b border-blue-200">Customer Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{order.customer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{order.email || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{order.phone || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Shipping Info */}
          {order.shippingAddress && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-blue-800 mb-3 pb-2 border-b border-blue-200">Shipping Address</h3>
              <p className="whitespace-pre-line">{order.shippingAddress}</p>
            </div>
          )}
          
          {/* Products */}
          <div className="mb-6">
            <h3 className="font-semibold text-blue-800 mb-3">Products</h3>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items && Array.isArray(order.items) ? (
                    order.items.map((item, index) => (
                      <tr key={index} className="hover:bg-blue-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            {item.image && (
                              <img src={item.image} alt={item.name} className="h-10 w-10 object-cover rounded-md mr-3" />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              {item.sku && <div className="text-xs text-gray-500">SKU: {item.sku}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            {item.quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-700">
                          ₹{item.price?.toFixed(2) || "0.00"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                          ₹{(item.price * item.quantity)?.toFixed(2) || "0.00"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-4 py-3 text-center text-gray-500">
                        No items found in this order.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-3">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">₹{calculateSubtotal().toFixed(2)}</span>
              </div>
              {order.shipping !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-medium">₹{order.shipping?.toFixed(2) || "0.00"}</span>
                </div>
              )}
              {order.tax !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">₹{order.tax?.toFixed(2) || "0.00"}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-800 font-semibold">Total:</span>
                <span className="font-bold text-blue-700 text-lg">₹{order.total?.toFixed(2) || "0.00"}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
