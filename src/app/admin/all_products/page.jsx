"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const ProductRequests = () => {
  const [products, setProducts] = useState([]);
  const [searchByName, setSearchByName] = useState("");
  const [searchById, setSearchById] = useState("");
  const [searchByMerchantId, setSearchByMerchantId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const router = useRouter();

  // Fetch the admin token from localStorage
  const getAuthToken = () => {
    try {
      return localStorage.getItem("adminToken");
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      return null;
    }
  };

  // Fetch filtered products from the API
  const fetchFilteredProducts = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        router.push("/admin/login");
        return;
      }

      // Prepare query parameters for filtering
      const params = new URLSearchParams();
      if (searchByName) params.append("product_name", searchByName);
      if (searchById) params.append("product_id", searchById);
      if (searchByMerchantId) params.append("merchant_id", searchByMerchantId);

      const response = await fetch(`${apiBaseUrl}/productadmin?${params.toString()}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
        setError(null);
      } else {
        console.error("Failed to fetch products");
        setError("Failed to fetch products. Please try again.");
        if (response.status === 401) {
          router.push("/admin/login");
        }
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("An error occurred while fetching products.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all products on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await fetchFilteredProducts();
      } catch (error) {
        console.error("Error in initial data fetch:", error);
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);

  const handleRowClick = (productId) => {
    if (productId) {
      router.push(`/admin/all_products/${productId}`);
    }
  };

  const handleReset = () => {
    setSearchByName("");
    setSearchById("");
    setSearchByMerchantId("");
    fetchFilteredProducts();
  };

  const handleSearchKeyDown = (e) => {
    if (e && e.key === 'Enter') {
      fetchFilteredProducts();
    }
  };

  // Loading state UI
  if (loading && (!Array.isArray(products) || products.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-lg font-medium text-gray-700">Loading products...</p>
      </div>
    );
  }

  // Calculate product count safely
  const productCount = Array.isArray(products) ? products.length : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
            All Products
            <span className="ml-3 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {productCount} items
            </span>
          </h1>
        </div>

        {/* Search Panel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Search Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label htmlFor="productName" className="block text-sm font-medium text-gray-700">
                Product Name
              </label>
              <div className="relative">
                <input
                  id="productName"
                  type="text"
                  placeholder="Enter product name..."
                  value={searchByName || ""}
                  onChange={(e) => setSearchByName(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {searchByName && (
                  <button 
                    onClick={() => setSearchByName('')}
                    className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="productId" className="block text-sm font-medium text-gray-700">
                Product ID
              </label>
              <div className="relative">
                <input
                  id="productId"
                  type="text"
                  placeholder="Enter product ID..."
                  value={searchById || ""}
                  onChange={(e) => setSearchById(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {searchById && (
                  <button 
                    onClick={() => setSearchById('')}
                    className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="merchantId" className="block text-sm font-medium text-gray-700">
                Merchant ID
              </label>
              <div className="relative">
                <input
                  id="merchantId"
                  type="text"
                  placeholder="Enter merchant ID..."
                  value={searchByMerchantId || ""}
                  onChange={(e) => setSearchByMerchantId(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {searchByMerchantId && (
                  <button 
                    onClick={() => setSearchByMerchantId('')}
                    className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <button
              onClick={fetchFilteredProducts}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors shadow-sm flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              Search
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-6 py-2.5 rounded-lg transition-colors flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Reset
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
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

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading && Array.isArray(products) && products.length > 0 && (
            <div className="p-4 bg-blue-50 border-b border-blue-100 flex items-center">
              <div className="w-5 h-5 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mr-3"></div>
              <p className="text-sm text-blue-700">Refreshing products...</p>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merchant ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(products) && products.length > 0 ? (
                  products.map((product) => product && (
                    <tr
                      key={product.product_id || `product-${Math.random()}`}
                      className="hover:bg-blue-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{product.product_id || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium max-w-xs truncate">{product.product_name || 'Unnamed Product'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.merchant_id || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {product.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.brand || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">₹{product.merchant_price || '0'}</span>
                        <span className="text-xs text-gray-500 ml-1">+{product.tax || '0'}%</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          {product.gender || 'Unspecified'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(product.product_id);
                          }}
                          className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-lg font-medium text-gray-900 mb-1">No products found</p>
                        <p className="text-sm text-gray-500">
                          {searchByName || searchById || searchByMerchantId
                            ? "Try adjusting your search criteria"
                            : "There are no products available at the moment"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductRequests;
