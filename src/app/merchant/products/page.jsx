"use client";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductTable from "../components/ProductTable";
import ProductForm from "../components/ProductForm";
import EditProductForm from "../components/EditProductForm";

export default function ProductManagementPage() {
  const [products, setProducts] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [filters, setFilters] = useState({
    gender: "",
    status: "",
    category: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch products with optional filters
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("merctoken");

      // Build query string based on filters
      const queryParams = new URLSearchParams(
        Object.entries(filters).reduce((acc, [key, value]) => {
          if (value) acc[key] = value; // Only include non-empty filters
          return acc;
        }, {})
      ).toString();

      const response = await axios.get(
        `${apiBaseUrl}/merchantproducts${queryParams ? `?${queryParams}` : ""}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.error === "pending") {
        window.location.href = "/merchant/pending";
        return;
      }

      if (response.data.error === "on hold") {
        window.location.href = "/merchant/hold";
        return;
      }

      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filters]); // Re-fetch products whenever filters change

  const handleFilterChange = (newFilters) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...newFilters }));
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsEditing(false);
    setIsFormVisible(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsEditing(true);
    setIsFormVisible(true);
  };

  const handleCloseForm = () => {
    setIsFormVisible(false);
    setSelectedProduct(null);
  };

  const handleAddNewProduct = async (productData) => {
    try {
      const token = localStorage.getItem("merctoken");
      const formData = new FormData();
      Object.entries(productData).forEach(([key, value]) => {
        if (key === "product_image") {
          for (let i = 0; i < value.length; i++) {
            formData.append("product_image", value[i]);
          }
        } else {
          formData.append(key, value);
        }
      });

      // const response = await axios.post(`${apiBaseUrl}/product`, formData, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });

      if (response.status === 201) {
        setIsFormVisible(false);
        setSelectedProduct(null);
        fetchProducts();
      }
    } catch (error) {
      console.error("Error adding product:", error.response?.data || error.message);
    }
  };

  const handleEditExistingProduct = async (productData) => {
    try {
      const token = localStorage.getItem("merctoken");
      const response = await axios.put(
        `${apiBaseUrl}/updateproduct/${selectedProduct.product_id}`,
        productData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.error === "on hold") {
        window.location.href = "/merchant/hold";
        return;
      }

      if (response.status === 200) {
        setIsFormVisible(false);
        setSelectedProduct(null);
        fetchProducts();
      }
    } catch (error) {
      console.error("Error updating product:", error);
      if (error.response?.status === 403 && error.response?.data.error === "on hold") {
        window.location.href = "/merchant/hold";
      }
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }
    
    try {
      const token = localStorage.getItem("merctoken");
      const response = await axios.delete(
        `${apiBaseUrl}/productmerchant/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.error === "on hold") {
        window.location.href = "/merchant/hold";
        return;
      }

      if (response.status === 200) {
        fetchProducts();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      if (error.response?.status === 403 && error.response?.data.error === "on hold") {
        window.location.href = "/merchant/hold";
      }
    }
  };

  const handleSetDiscount = async (productId, discountValue) => {
    try {
      const token = localStorage.getItem("merctoken");
      const response = await axios.post(
        `${apiBaseUrl}/merchant/product/discount`,
        {
          product_id: productId,
          discount: discountValue
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.error === "on hold") {
        window.location.href = "/merchant/hold";
        return;
      }

      if (response.status === 200) {
        // Update the local products array with the updated product while preserving the status
        setProducts(prevProducts => 
          prevProducts.map(product => {
            if (product.product_id === productId) {
              return {
                ...response.data.product,
                status: product.status // Preserve the original status
              };
            }
            return product;
          })
        );
      }
    } catch (error) {
      console.error("Error setting product discount:", error);
      if (error.response?.status === 403 && error.response?.data.error === "on hold") {
        window.location.href = "/merchant/hold";
      }
    }
  };

  return (
    <div>
      {/* Header section with stats and action button */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
            <p className="text-gray-500 mt-1">Manage your product catalog</p>
            
            <div className="mt-4 flex items-center gap-8">
              <div>
                <p className="text-gray-500 text-sm">Total Products</p>
                <p className="text-2xl font-bold text-gray-800">{products.length}</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleAddProduct}
            className="mt-4 md:mt-0 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Product
          </button>
        </div>
      </div>

      {/* Product form modal */}
      {isFormVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-semibold text-gray-800">
                {isEditing ? "Edit Product" : "Add New Product"}
              </h2>
              <button 
                onClick={handleCloseForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {isEditing ? (
                <EditProductForm
                  selectedProduct={selectedProduct}
                  onSubmit={handleEditExistingProduct}
                  onClose={handleCloseForm}
                />
              ) : (
                <ProductForm onSubmit={handleAddNewProduct} onClose={handleCloseForm} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Products table with loading state */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <ProductTable
            products={products}
            filters={filters}
            onFilterChange={handleFilterChange}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onDiscount={handleSetDiscount}
          />
        )}
      </div>
    </div>
  );
}
