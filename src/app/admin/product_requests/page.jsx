"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const ProductRequests = () => {
  const [products, setProducts] = useState([]); // Start with an empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("adminToken");
        if (!token) {
          router.push("/admin/login");
        }

        const headers = { Authorization: `Bearer ${token}` };
        const response = await fetch(`${apiBaseUrl}/productapproval`, { headers });

        if (response.ok) {
          const data = await response.json();
          setProducts(data || []); // Ensure it's always an array
        } else {
          console.error("Failed to fetch products");
          setError("Failed to fetch products.");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(error.message || "Failed to fetch products.");
        if (error.response && error.response.status === 401) {
          router.push("/admin/login"); // Redirect on Unauthorized (401)
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleView = (productId) => {
    router.push(`/admin/product_requests/${productId}`);
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-lg font-medium text-gray-700">Loading product requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-center text-lg font-semibold text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-center text-red-500 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
            Product Requests
            <span className="ml-3 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {products.length} requests
            </span>
          </h1>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute left-3 top-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.product_id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:translate-y-[-4px]">
                <div className="relative h-56 bg-gray-200 overflow-hidden">
                  {product.product_image ? (
                    <img 
                      src={product.product_image.split(',')[0]} 
                      alt={product.product_name} 
                      className="w-full h-full object-contain bg-white p-2"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gray-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-md">
                    Pending
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="font-semibold text-lg text-gray-800 mb-1 line-clamp-1">{product.product_name}</h2>
                      <p className="text-sm text-gray-500 mb-2">SKU: {product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-blue-600">₹{product.merchant_price}</p>
                      <p className="text-xs text-gray-500">+{product.tax}% tax, {product.margin}% margin</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 line-clamp-2 mb-3">{product.short_description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md">{product.category}</span>
                    <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md">{product.brand}</span>
                    <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md">{product.gender}</span>
                  </div>
                  
                  <div className="border-t pt-4">
                    <button
                      onClick={() => handleView(product.product_id)}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Product Requests Found</h3>
            <p className="text-gray-500">
              {searchTerm ? `No results found for "${searchTerm}"` : 'There are currently no pending product requests.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductRequests;
