"use client";

import React, { useState } from "react";
import { Search, Filter, ChevronDown, Edit, Trash2, Eye, AlertTriangle, Percent } from "lucide-react";

const ProductTable = ({ products = [], filters = {}, onFilterChange, onEdit, onDelete, onDiscount }) => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [discountValue, setDiscountValue] = useState(0);

  const categoriesList = [
    "Tops",
    "Bottoms",
    "Formal",
    "Casual",
    "Jackets",
    "Dresses",
    "Sportswear",
    "Footwear",
    "Accessories",
    "Outerwear",
  ];

  // Calculate the original price before discount
  const calculateOriginalPrice = (product) => {
    if (!product) return 0;

    const basePrice = product.merchant_price;
    const marginAmount = basePrice * (product.margin / 100);
    const priceWithMargin = basePrice + marginAmount;
    const taxAmount = priceWithMargin * (product.tax / 100);
    const originalPrice = priceWithMargin + taxAmount;

    return Math.round(originalPrice);
  };

  // Calculate the final price with discount
  const calculateFinalPrice = (product) => {
    if (!product) return 0;
    
    const originalPrice = calculateOriginalPrice(product);
    const discountAmount = originalPrice * (product.discount / 100);
    
    return Math.round(originalPrice - discountAmount);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value });
  };

  const toggleRow = (productId) => {
    setExpandedRow(expandedRow === productId ? null : productId);
  };

  // Function to handle null values in product data
  const safeValue = (value, defaultText = "—") => {
    return value || defaultText;
  };

  const openDiscountModal = (product, e) => {
    e.stopPropagation();
    setSelectedProduct(product);
    // Set the initial discount value to the product's current discount
    setDiscountValue(product.discount || 0);
    setShowDiscountModal(true);
  };

  const handleDiscountSubmit = () => {
    if (selectedProduct && onDiscount) {
      onDiscount(selectedProduct.product_id, discountValue);
      setShowDiscountModal(false);
    }
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-200">
      {/* Header with Filters Toggle */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Products</h2>
        <button 
          onClick={() => setShowFilterPanel(!showFilterPanel)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-gray-600 text-sm"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilterPanel ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Discount Modal */}
      {showDiscountModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Set Discount</h3>
            
            <div className="mb-6">
              <div className="flex items-center">
                <img 
                  src={selectedProduct.product_image?.split(",")[0]} 
                  alt={selectedProduct.product_name}
                  className="w-16 h-16 object-cover rounded-md mr-3"
                />
                <div>
                  <p className="font-semibold text-gray-800">{selectedProduct.product_name}</p>
                  <p className="text-sm text-gray-500">SKU: {selectedProduct.sku}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Base Price:</span>
                <span className="font-medium">₹{selectedProduct.merchant_price}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">+ Margin ({selectedProduct.margin}%):</span>
                <span className="font-medium">₹{Math.round(selectedProduct.merchant_price * selectedProduct.margin / 100)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">+ Tax ({selectedProduct.tax}%):</span>
                <span className="font-medium">₹{Math.round(selectedProduct.merchant_price * (1 + selectedProduct.margin / 100) * selectedProduct.tax / 100)}</span>
              </div>
              <div className="border-t border-gray-200 my-2 pt-2 flex justify-between font-semibold">
                <span>Original Price:</span>
                <span>₹{calculateOriginalPrice(selectedProduct)}</span>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Percentage:
              </label>
              <div className="flex items-center">
                <div className="relative flex-grow">
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseInt(e.target.value) || 0)}
                    min="0"
                    max="100"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-3 pr-12 py-2"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Percent className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <button 
                  onClick={() => setDiscountValue(0)}
                  className="ml-2 px-2 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
                  title="Reset discount"
                >
                  Reset
                </button>
              </div>
              
              {/* Show current discount if it exists */}
              {selectedProduct.discount > 0 && discountValue !== selectedProduct.discount && (
                <p className="mt-1 text-sm text-amber-600">
                  Current discount: {selectedProduct.discount}%
                </p>
              )}
              
              <div className="mt-4 flex items-center">
                <div className="bg-green-50 border border-green-100 rounded-lg p-3 w-full">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Original Price:</span>
                    <span className="font-medium">₹{calculateOriginalPrice(selectedProduct)}</span>
                  </div>
                  
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-700">Discount ({discountValue}%):</span>
                    <span className="font-medium text-red-600">-₹{Math.round(calculateOriginalPrice(selectedProduct) * discountValue / 100)}</span>
                  </div>
                  
                  <div className="flex justify-between mt-2 text-lg font-semibold border-t border-green-200 pt-2">
                    <span className="text-gray-800">New Price:</span>
                    <span className="text-green-700">₹{Math.round(calculateOriginalPrice(selectedProduct) * (1 - discountValue / 100))}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDiscountModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDiscountSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Apply Discount
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters Panel */}
      <div className={`transition-all duration-300 ${showFilterPanel ? 'max-h-96' : 'max-h-0 overflow-hidden'}`}>
        <div className="flex flex-wrap gap-4 p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex-1 min-w-[180px]">
            <label htmlFor="gender" className="block text-sm font-medium text-gray-600">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={filters.gender || ""}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-lg border-gray-300 bg-white px-3 py-2 text-sm border shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="unisex">Unisex</option>
            </select>
          </div>

          <div className="flex-1 min-w-[180px]">
            <label htmlFor="status" className="block text-sm font-medium text-gray-600">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={filters.status || ""}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-lg border-gray-300 bg-white px-3 py-2 text-sm border shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="removed by admin">Removed by Admin</option>
              <option value="removed by merchant">Removed by Merchant</option>
            </select>
          </div>

          <div className="flex-1 min-w-[180px]">
            <label htmlFor="category" className="block text-sm font-medium text-gray-600">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={filters.category || ""}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-lg border-gray-300 bg-white px-3 py-2 text-sm border shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All</option>
              {categoriesList.map((category) => (
                <option key={category} value={category.toLowerCase()}>
                  {category}
                </option>
              ))}
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
                placeholder="Search products..."
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

      {/* Products List */}
      <div className="overflow-x-auto">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <AlertTriangle className="w-12 h-12 text-orange-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-1">No Products Found</h3>
            <p className="text-gray-500 text-center max-w-md">
              No products match your current filter criteria. Try adjusting your filters or add new products.
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price & Details
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <React.Fragment key={product.product_id || `product-${Math.random()}`}>
                  <tr
                    onClick={() => toggleRow(product.product_id)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 rounded-md overflow-hidden border border-gray-200">
                          {product.product_image ? (
                            <img
                              src={product.product_image.split(",")[0]}
                              alt={product.product_name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-500">
                              <Eye className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {safeValue(product.product_name, "Unnamed Product")}
                          </div>
                          <div className="text-sm text-gray-500">
                            SKU: {safeValue(product.sku)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-semibold">
                        {product.discount > 0 ? (
                          <>
                            <span className="text-gray-400 line-through mr-2">₹{calculateOriginalPrice(product)}</span>
                            <span className="text-green-600">₹{calculateFinalPrice(product)}</span>
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              <Percent className="w-3 h-3 mr-1" />
                              {product.discount}% Off
                            </span>
                          </>
                        ) : (
                          <>₹{safeValue(product.final_price, "0.00")}</>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        Base: ₹{safeValue(product.merchant_price, "0.00")} | Margin: {safeValue(product.margin, "0")}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${product.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        product.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'}`}
                      >
                        {safeValue(product.status, "Unknown")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                        {product.status !== "removed by admin" && product.status !== "removed by merchant" && (
                          <>
                            <button
                              onClick={() => onEdit(product)}
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50"
                              title="Edit Product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => openDiscountModal(product, e)}
                              className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                              title="Set Discount"
                            >
                              <Percent className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDelete(product.product_id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedRow === product.product_id && (
                    <tr className="bg-gray-50">
                      <td colSpan="4" className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Product Details</h4>
                            <div className="space-y-1 text-sm">
                              <p><span className="text-gray-500">Description:</span> {safeValue(product.short_description)}</p>
                              <p><span className="text-gray-500">Category:</span> {safeValue(product.category)}</p>
                              <p><span className="text-gray-500">Brand:</span> {safeValue(product.brand)}</p>
                              <p><span className="text-gray-500">Gender:</span> {safeValue(product.gender)}</p>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Specifications</h4>
                            <div className="space-y-1 text-sm">
                              <p><span className="text-gray-500">Size:</span> {safeValue(product.size)}</p>
                              <p><span className="text-gray-500">Color:</span> {safeValue(product.color)}</p>
                              <p><span className="text-gray-500">Tag:</span> {safeValue(product.tag)}</p>
                              <p><span className="text-gray-500">Additional Info:</span> {safeValue(product.additional_info)}</p>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Images</h4>
                            <div className="flex gap-2 overflow-x-auto">
                              {product.product_image ?
                                product.product_image.split(",").map((img, index) => (
                                  <img
                                    key={index}
                                    src={img}
                                    alt={`Product ${index + 1}`}
                                    className="h-16 w-16 object-cover rounded-md border border-gray-200"
                                  />
                                )) : 
                                <p className="text-gray-500">No images available</p>
                              }
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProductTable;
