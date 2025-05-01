"use client";

import React from "react";
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, AlertTriangle } from "lucide-react";

const OverviewCard = ({ title, value, bgColor, icon, percentage, trend }) => {
  // Handle null or undefined values
  const displayValue = value ?? "N/A";
  const displayPercentage = percentage ?? 0;
  const displayTrend = trend ?? "neutral";
  
  // Define a default icon if none is provided
  const getIconComponent = () => {
    if (icon) return icon;
    
    switch (title) {
      case "Total Sales":
        return <DollarSign className="h-6 w-6" />;
      case "Total Orders":
        return <ShoppingBag className="h-6 w-6" />;
      case "Low Stock Alerts":
        return <AlertTriangle className="h-6 w-6" />;
      default:
        return <DollarSign className="h-6 w-6" />;
    }
  };

  // Get trend icon and style
  const getTrendIndicator = () => {
    if (displayTrend === "up") {
      return {
        icon: <TrendingUp className="h-4 w-4" />,
        textColor: "text-green-500",
        bgColor: "bg-green-100"
      };
    } else if (displayTrend === "down") {
      return {
        icon: <TrendingDown className="h-4 w-4" />,
        textColor: "text-red-500",
        bgColor: "bg-red-100"
      };
    }
    return {
      icon: null,
      textColor: "text-gray-500",
      bgColor: "bg-gray-100"
    };
  };

  const trendIndicator = getTrendIndicator();

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-lg ${bgColor} bg-opacity-10`}>
            <div className={`text-${bgColor.split('-')[1]}-600`}>
              {getIconComponent()}
            </div>
          </div>
          {displayPercentage !== 0 && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${trendIndicator.bgColor} ${trendIndicator.textColor} text-xs font-medium`}>
              {trendIndicator.icon}
              <span>{Math.abs(displayPercentage)}%</span>
            </div>
          )}
        </div>
        
        <div className="mb-1">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-bold text-gray-800 mt-1">{displayValue}</p>
        </div>
      </div>
      
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-500">Updated today</p>
      </div>
    </div>
  );
};

export default OverviewCard;
