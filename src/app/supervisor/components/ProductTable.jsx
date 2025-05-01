"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

const ProductTable = ({ products, onEdit, onDelete }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const itemsPerPage = 10;

  // Handle row click to navigate to product details
  const handleRowClick = (productId) => {
    router.push(`/products/${productId}`);
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  // Sorting function
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filter and sort products based on search term and sort config
  const filteredProducts = useMemo(() => {
    let filteredItems = [...products];
    
    // Filter by search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filteredItems = filteredItems.filter(product => 
        product.product_name?.toLowerCase().includes(lowerSearchTerm) ||
        product.sku?.toLowerCase().includes(lowerSearchTerm) ||
        product.product_id?.toString().includes(lowerSearchTerm) ||
        product.category?.toLowerCase().includes(lowerSearchTerm) ||
        product.brand?.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // Sort items
    if (sortConfig.key) {
      filteredItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filteredItems;
  }, [products, searchTerm, sortConfig]);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Get class for sortable headers
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return 'text-gray-400';
    return sortConfig.direction === 'asc' ? 'text-blue-600' : 'text-blue-600 rotate-180';
  };

  // Table headers with sorting capability
  const headers = [
    { key: 'product_id', label: 'ID' },
    { key: 'product_name', label: 'Name' },
    { key: 'short_description', label: 'Description' },
    { key: 'size', label: 'Size' },
    { key: 'color', label: 'Color' },
    { key: 'sku', label: 'SKU' },
    { key: 'category', label: 'Category' },
    { key: 'brand', label: 'Brand' },
    { key: 'merchant_price', label: 'Price' },
    { key: 'final_price', label: 'Final Price' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div className="relative bg-white rounded-lg shadow-sm">
      {/* Search and Filter Controls */}
      <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between">
        <div className="relative w-full md:w-64 mb-2 md:mb-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="text-sm text-gray-500">
          Total: <span className="font-semibold text-blue-600">{filteredProducts.length}</span> products
        </div>
      </div>

      {/* Product Table */}
      <div className="overflow-x-auto" style={{ maxHeight: "600px" }}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="sticky top-0 bg-gray-50">
            <tr>
              {headers.map((header) => (
                <th 
                  key={header.key} 
                  onClick={() => requestSort(header.key)}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-1">
                    <span>{header.label}</span>
                    <svg 
                      className={`w-4 h-4 transform transition-transform ${getSortIndicator(header.key)}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                    </svg>
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.length > 0 ? (
              currentItems.map((product) => (
                <tr
                  key={product.product_id}
                  className="hover:bg-blue-50 cursor-pointer transition-colors duration-150"
                  onClick={() => handleRowClick(product.product_id)}
                >
                  <td className="px-4 py-3 whitespace-nowrap">{product.product_id}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{product.product_name}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{product.short_description}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{product.size}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center">
                      {product.color}
                      {product.color && (
                        <span 
                          className="ml-2 h-3 w-3 rounded-full inline-block" 
                          style={{ backgroundColor: product.color }}
                        ></span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-sm">{product.sku}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{product.brand}</td>
                  <td className="px-4 py-3 whitespace-nowrap">₹{product.merchant_price}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-semibold">₹{product.final_price}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      product.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click
                        onEdit(product);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-3 transition-colors duration-150"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click
                        onDelete(product.product_id);
                      }}
                      className="text-red-600 hover:text-red-900 transition-colors duration-150"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length + 1} className="px-4 py-8 text-center text-gray-500">
                  No products found. Try a different search term.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                <span className="font-medium">
                  {indexOfLastItem > filteredProducts.length ? filteredProducts.length : indexOfLastItem}
                </span>{" "}
                of <span className="font-medium">{filteredProducts.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  
                  if (pageNumber <= totalPages) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => paginate(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNumber
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  }
                  return null;
                })}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTable;
