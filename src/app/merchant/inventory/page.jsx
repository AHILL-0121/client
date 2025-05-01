"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, RefreshCcw, Edit2, Check, X, Box, AlertCircle, Layers, Package } from "lucide-react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editItemID, setEditItemID] = useState(null);
  const [updatedValues, setUpdatedValues] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("merctoken");
      if (!token) {
        window.location.href = "/merchant/login";
        return;
      }

      const response = await axios.get(`${apiBaseUrl}/merchantinventory`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.error === "pending") {
        window.location.href = "/merchant/pending";
        return;
      }
      
      if (response.data.error === "on hold") {
        window.location.href = "/merchant/hold";
        return;
      }

      // Handle possible null values and sort inventory
      const validInventory = Array.isArray(response.data) ? response.data : [];
      const sortedInventory = validInventory.sort((a, b) => 
        (a.product_id || 0) - (b.product_id || 0)
      );
      
      setInventory(sortedInventory);
      setErrorMessage("");
    } catch (error) {
      console.error("Error fetching inventory:", error);
      setErrorMessage("Failed to load inventory data. Please try again.");
      
      if (error.response) {
        if (error.response.status === 401) {
          window.location.href = "/merchant/login";
        } else if (error.response.status === 403 && error.response.data.error === "pending") {
          window.location.href = "/merchant/pending";
        } else if (error.response.status === 403 && error.response.data.error === "on hold") {
          window.location.href = "/merchant/hold";
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleProductClick = (productID) => {
    setSelectedProduct(productID === selectedProduct ? null : productID);
  };

  const handleEdit = (item) => {
    setEditItemID(item.ID);
    setUpdatedValues({ 
      stock: item.stock || 0, 
      threshold: item.threshold || 5 
    });
  };

  const handleCancel = () => {
    setEditItemID(null);
    setUpdatedValues({});
  };

  const handleConfirm = async (item) => {
    const token = localStorage.getItem("merctoken");
    try {
      const stockInt = parseInt(updatedValues.stock, 10);
      const thresholdInt = parseInt(updatedValues.threshold, 10);

      if (isNaN(stockInt) || isNaN(thresholdInt)) {
        setErrorMessage("Invalid stock or threshold values. Please enter numbers only.");
        return;
      }

      await axios.put(
        `${apiBaseUrl}/merchantinventoryedit`,
        {
          product_id: item.product_id,
          size: item.size,
          color: item.color,
          stock: stockInt,
          threshold: thresholdInt,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setInventory((prev) =>
        prev.map((i) =>
          i.ID === item.ID
            ? { ...i, stock: stockInt, threshold: thresholdInt }
            : i
        )
      );
      setEditItemID(null);
      setErrorMessage("");
    } catch (error) {
      console.error("Error updating inventory:", error);
      setErrorMessage("Failed to update inventory. Please try again.");
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (searchQuery.trim()) {
      try {
        setLoading(true);
        const token = localStorage.getItem("merctoken");
        const response = await axios.get(`${apiBaseUrl}/merchantinventory?product_id=${searchQuery}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (Array.isArray(response.data) && response.data.length > 0) {
          setInventory(response.data);
          setSearchError(false);
          setErrorMessage("");
        } else {
          setSearchError(true);
          setInventory([]);
          setErrorMessage(`No products found with ID: ${searchQuery}`);
        }
      } catch (error) {
        console.error("Error searching inventory:", error);
        setSearchError(true);
        setInventory([]);
        setErrorMessage("Failed to search inventory. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      fetchInventory();
    }
  };

  const handleResetSearch = async () => {
    setSearchQuery("");
    setSearchError(false);
    setErrorMessage("");
    await fetchInventory();
  };

  // Function to get product color for low stock indicator
  const getStockIndicator = (stock, threshold) => {
    const stockNum = parseInt(stock || 0, 10);
    const thresholdNum = parseInt(threshold || 5, 10);
    
    if (stockNum <= 0) {
      return "bg-red-100 text-red-800 border-red-200";
    } else if (stockNum <= thresholdNum) {
      return "bg-amber-100 text-amber-800 border-amber-200";
    } else {
      return "bg-green-100 text-green-800 border-green-200";
    }
  };

  if (loading && inventory.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
          <p className="text-gray-500 mt-1">Manage your product stock levels and thresholds</p>
        </div>
        
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Product ID"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Search
          </button>
          <button
            type="button"
            onClick={handleResetSearch}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-1"
          >
            <RefreshCcw className="h-4 w-4" />
            <span>Reset</span>
          </button>
        </form>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center text-red-700">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      {inventory.length === 0 && !loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-10 text-center">
          <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-1">No Inventory Found</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            {searchError 
              ? "No products match your search criteria. Try a different Product ID." 
              : "You don't have any inventory items yet."}
          </p>
          <button
            onClick={handleResetSearch}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            View All Inventory
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inventory
            .reduce((products, item) => {
              if (!products.some((p) => p.product_id === item.product_id)) {
                products.push(item);
              }
              return products;
            }, [])
            .map((product) => {
              // Get product variants (color/size combinations) 
              const variants = inventory.filter(item => item.product_id === product.product_id);
              
              // Count items that are low in stock or out of stock
              const lowStockCount = variants.filter(item => {
                const stockNum = parseInt(item.stock || 0, 10);
                const thresholdNum = parseInt(item.threshold || 5, 10);
                return stockNum <= thresholdNum && stockNum > 0;
              }).length;
              
              const outOfStockCount = variants.filter(item => {
                return parseInt(item.stock || 0, 10) <= 0;
              }).length;
              
              return (
                <div key={product.product_id || `product-${Math.random()}`} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {/* Product Header */}
                  <div 
                    className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleProductClick(product.product_id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-800">
                          Product ID: {product.product_id || "Unknown"}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                          {variants.length} variants • {outOfStockCount > 0 ? (
                            <span className="text-red-600">{outOfStockCount} out of stock</span>
                          ) : lowStockCount > 0 ? (
                            <span className="text-amber-600">{lowStockCount} low stock</span>
                          ) : (
                            <span className="text-green-600">All in stock</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center justify-center bg-gray-100 h-10 w-10 rounded-full text-gray-500">
                        {selectedProduct === product.product_id ? 
                          <Layers className="h-5 w-5" /> : 
                          <Box className="h-5 w-5" />
                        }
                      </div>
                    </div>
                  </div>

                  {/* Expanded Product Details */}
                  {selectedProduct === product.product_id && (
                    <div className="bg-gray-50 p-4">
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                        Stock by Variant
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-100">
                            <tr>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Size
                              </th>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Color
                              </th>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stock
                              </th>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Threshold
                              </th>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {variants.map((item, index) => {
                              const stockIndicator = getStockIndicator(item.stock, item.threshold);
                              
                              return (
                                <tr key={item.ID || index} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                    {item.size || "—"}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                    {item.color || "—"}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    {editItemID === item.ID ? (
                                      <input
                                        type="number"
                                        value={updatedValues.stock}
                                        onChange={(e) =>
                                          setUpdatedValues({
                                            ...updatedValues,
                                            stock: e.target.value,
                                          })
                                        }
                                        className="w-20 p-1 text-sm border border-gray-300 rounded"
                                        min="0"
                                      />
                                    ) : (
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockIndicator}`}>
                                        {item.stock || 0}
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    {editItemID === item.ID ? (
                                      <input
                                        type="number"
                                        value={updatedValues.threshold}
                                        onChange={(e) =>
                                          setUpdatedValues({
                                            ...updatedValues,
                                            threshold: e.target.value,
                                          })
                                        }
                                        className="w-20 p-1 text-sm border border-gray-300 rounded"
                                        min="1"
                                      />
                                    ) : (
                                      <span className="text-sm text-gray-700">{item.threshold || 5}</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    {editItemID === item.ID ? (
                                      <div className="flex space-x-2">
                                        <button
                                          onClick={() => handleConfirm(item)}
                                          className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                                        >
                                          <Check className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={handleCancel}
                                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => handleEdit(item)}
                                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
