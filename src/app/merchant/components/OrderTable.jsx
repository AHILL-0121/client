"use client";

import React, { useState } from "react";
import { ChevronDown, Filter, Search, Clock, CheckCircle, XCircle, TruckIcon, ShoppingBag, AlertCircle, ExternalLink } from "lucide-react";

const OrderTable = ({ orders = [], filters = {}, onFilterChange, onViewDetails }) => {
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  
  // Function to handle null values in order data
  const safeValue = (value, defaultText = "—") => {
    return value !== null && value !== undefined ? value : defaultText;
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (onFilterChange) {
      onFilterChange({ [name]: value });
    }
  };

  // Get status badge style based on status
  const getStatusBadge = (status) => {
    const statusText = String(status || "").toLowerCase();
    
    if (statusText.includes("delivered") || statusText === "completed") {
      return {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: <CheckCircle className="w-4 h-4 mr-1" />
      };
    } else if (statusText.includes("pending") || statusText === "processing") {
      return {
        bg: "bg-blue-100",
        text: "text-blue-800",
        icon: <Clock className="w-4 h-4 mr-1" />
      };
    } else if (statusText.includes("transit") || statusText.includes("shipping")) {
      return {
        bg: "bg-purple-100",
        text: "text-purple-800",
        icon: <TruckIcon className="w-4 h-4 mr-1" />
      };
    } else if (statusText.includes("cancelled") || statusText.includes("rejected")) {
      return {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: <XCircle className="w-4 h-4 mr-1" />
      };
    } else if (statusText.includes("placed") || statusText.includes("confirmed")) {
      return {
        bg: "bg-indigo-100",
        text: "text-indigo-800",
        icon: <ShoppingBag className="w-4 h-4 mr-1" />
      };
    } else {
      return {
        bg: "bg-gray-100",
        text: "text-gray-800",
        icon: <AlertCircle className="w-4 h-4 mr-1" />
      };
    }
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-200">
      {/* Header with Filters Toggle */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Orders</h2>
        <button 
          onClick={() => setShowFilterPanel(!showFilterPanel)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-gray-600 text-sm"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilterPanel ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filters Panel */}
      <div className={`transition-all duration-300 ${showFilterPanel ? 'max-h-96' : 'max-h-0 overflow-hidden'}`}>
        <div className="flex flex-wrap gap-4 p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex-1 min-w-[180px]">
            <label htmlFor="status" className="block text-sm font-medium text-gray-600">
              Order Status
            </label>
            <select
              id="status"
              name="status"
              value={filters.status || ""}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-lg border-gray-300 bg-white px-3 py-2 text-sm border shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex-1 min-w-[180px]">
            <label htmlFor="date" className="block text-sm font-medium text-gray-600">
              Date Range
            </label>
            <select
              id="date"
              name="date"
              value={filters.date || ""}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-lg border-gray-300 bg-white px-3 py-2 text-sm border shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>

          <div className="flex-1 min-w-[180px]">
            <label htmlFor="search" className="block text-sm font-medium text-gray-600">
              Search
            </label>
            <div className="mt-1 relative">
              <input
                type="text"
                id="search"
                name="search"
                placeholder="Order ID, Customer Name..."
                value={filters.search || ""}
                onChange={handleFilterChange}
                className="block w-full rounded-lg border-gray-300 bg-white pl-10 pr-3 py-2 text-sm border shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <ShoppingBag className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-1">No Orders Found</h3>
            <p className="text-gray-500 text-center max-w-md">
              No orders match your current filter criteria or you haven't received any orders yet.
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => {
                const statusBadge = getStatusBadge(order.order_track_status || order.status);
                
                return (
                  <tr key={order.order_id || `order-${Math.random()}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        #{safeValue(order.order_id)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(order.CreatedAt || order.created_at || order.order_date)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {safeValue(order.customer_name || order.user_id || order.name, "Unknown Customer")}
                      </div>
                      <div className="text-xs text-gray-500">
                        {safeValue(order.payment_status|| order.payment, "cant fetch status")}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                        ₹{safeValue(order.total || order.total_amount || order.order_total, "0.00")}
                      </div>
                      <div className="text-xs text-gray-500">
                        {safeValue(order.items_count || (order.items && order.items.length) || "1", "0")} items
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                        {statusBadge.icon}
                        {safeValue(order.order_track_status || order.status, "Unknown")}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => onViewDetails && onViewDetails(order)}
                        className="text-indigo-600 hover:text-indigo-900 inline-flex items-center text-sm"
                      >
                        <span className="mr-1">View</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default OrderTable;
