import React from 'react';

export default function AccountSuspended() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your account is suspended.</h1>
          <p className="text-gray-700">
            Please contact the administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
