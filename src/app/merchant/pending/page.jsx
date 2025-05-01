import React from "react";

const MerchantPendingPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-10 text-center max-w-md mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          Your merchant approval is in progress
        </h1>
        <p className="text-gray-600">
          Please wait while we process your request. We will notify you once your account is approved.
        </p>
      </div>
    </div>
  );
};

export default MerchantPendingPage;
