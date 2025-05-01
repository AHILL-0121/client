"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation"; // Correct hook for dynamic routing

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const MerchantInventory = ({ params }) => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null); // For detailed view
  const [editItemID, setEditItemID] = useState(null); // ID of the row being edited
  const [updatedValues, setUpdatedValues] = useState({}); // Temporary storage for stock and threshold

  const router = useRouter(); // Initialize the router

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          router.push("/admin/login"); // Redirect if no token is found
          return;
        }

        const response = await axios.get(
          `${apiBaseUrl}/merchant_inventory/${params.merchantId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Sort the inventory by product_id in ascending order
        const sortedInventory = response.data.sort((a, b) => a.product_id - b.product_id);
        setInventory(sortedInventory);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching inventory:", error);
        if (error.response && error.response.status === 401) {
          router.push("/admin/login"); // Redirect on Unauthorized (401)
        }
        setLoading(false);
      }
    };

    fetchInventory();
  }, [params.merchantId, router]); // Added router as dependency

  const handleProductClick = (productID) => {
    setSelectedProduct(productID === selectedProduct ? null : productID);
  };

  const handleEdit = (item) => {
    setEditItemID(item.ID);
    setUpdatedValues({ stock: item.stock, threshold: item.threshold });
  };

  const handleCancel = () => {
    setEditItemID(null);
    setUpdatedValues({});
  };

  const handleConfirm = async (item) => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login"); // Redirect if no token is found
      return;
    }

    try {
      const stockInt = parseInt(updatedValues.stock, 10);
      const thresholdInt = parseInt(updatedValues.threshold, 10);

      if (isNaN(stockInt) || isNaN(thresholdInt)) {
        console.error("Invalid stock or threshold values.");
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
    } catch (error) {
      console.error("Error updating inventory:", error);
      if (error.response && error.response.status === 401) {
        router.push("/admin/login"); // Redirect on Unauthorized (401)
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-blue-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-blue-700 font-medium">Loading inventory data...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="p-6 bg-blue-50 min-h-screen">
      <h1 className="text-3xl font-semibold text-blue-800 mb-6 pb-2 border-b border-blue-200">
        Inventory for Merchant {params.merchantId}
      </h1>
      
      <div className="bg-white p-4 rounded-lg shadow-md border border-blue-100 mb-6">
        <h2 className="text-xl font-semibold text-blue-700 mb-4">Products Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventory
            .reduce((products, item) => {
              if (!products.some((p) => p.product_id === item.product_id)) {
                products.push(item);
              }
              return products;
            }, [])
            .map((product) => (
              <div
                key={product.product_id}
                className={`bg-white border rounded-lg p-4 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md ${
                  selectedProduct === product.product_id 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => handleProductClick(product.product_id)}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-blue-700">
                    Product ID: {product.product_id}
                  </h2>
                  <span className="text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </div>
                <p className="text-sm text-blue-500 mt-2">
                  {inventory.filter(item => item.product_id === product.product_id).length} variations available
                </p>
                <div className="mt-2 text-xs text-gray-500">Click to view details</div>
              </div>
            ))}
        </div>
      </div>
      
      {selectedProduct && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-blue-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-blue-800">
              Product ID: {selectedProduct}
            </h2>
            <button 
              onClick={() => setSelectedProduct(null)}
              className="text-blue-600 hover:text-blue-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="px-4 py-3 text-left font-semibold">Size</th>
                  <th className="px-4 py-3 text-left font-semibold">Color</th>
                  <th className="px-4 py-3 text-left font-semibold">Stock</th>
                  <th className="px-4 py-3 text-left font-semibold">Threshold</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory
                  .filter((item) => item.product_id === selectedProduct)
                  .map((item, index) => (
                    <tr key={index} className="border-b border-blue-100 hover:bg-blue-50 transition-colors">
                      <td className="px-4 py-3">{item.size}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <span className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: item.color.toLowerCase() }}></span>
                          {item.color}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {editItemID === item.ID ? (
                          <input
                            type="number"
                            value={updatedValues.stock}
                            onChange={(e) =>
                              setUpdatedValues({ ...updatedValues, stock: e.target.value })
                            }
                            className="border border-blue-300 rounded px-2 py-1 w-20 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                        ) : (
                          <span className="font-medium">{item.stock}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editItemID === item.ID ? (
                          <input
                            type="number"
                            value={updatedValues.threshold}
                            onChange={(e) =>
                              setUpdatedValues({ ...updatedValues, threshold: e.target.value })
                            }
                            className="border border-blue-300 rounded px-2 py-1 w-20 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                        ) : (
                          <span className="font-medium">{item.threshold}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.stock <= 0 ? 'bg-red-100 text-red-800' : 
                          item.stock <= item.threshold ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {item.stock <= 0 ? 'Out of Stock' : 
                           item.stock <= item.threshold ? 'Low Stock' : 
                           'In Stock'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {editItemID === item.ID ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleConfirm(item)}
                              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors shadow-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancel}
                              className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors shadow-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(item)}
                            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition-colors shadow-sm flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantInventory;
