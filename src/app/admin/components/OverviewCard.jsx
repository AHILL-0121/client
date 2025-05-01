"use client";

import React from "react";

const OverviewCard = ({ title, value, bgColor, icon }) => {
  // Default icon if not provided
  const defaultIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 opacity-80" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  );

  // Icons based on card type
  const getIcon = () => {
    if (icon) return icon;
    
    if (title.toLowerCase().includes("sales")) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 opacity-80" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
      );
    } else if (title.toLowerCase().includes("order")) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 opacity-80" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
        </svg>
      );
    } else if (title.toLowerCase().includes("stock") || title.toLowerCase().includes("alert")) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 opacity-80" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    }
    
    return defaultIcon;
  };

  return (
    <div
      className={`p-6 rounded-lg text-white ${bgColor} shadow-md overflow-hidden relative transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 border border-white/10`}
    >
      <div className="absolute right-3 top-3 opacity-80">{getIcon()}</div>
      <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-white opacity-10"></div>
      <div className="absolute -top-10 -left-10 h-24 w-24 rounded-full bg-white opacity-5"></div>
      
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
      
      <div className="mt-4 text-xs opacity-80 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        Updated just now
      </div>
    </div>
  );
};

export default OverviewCard;
