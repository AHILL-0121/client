"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function MerchantProductDetails({ params }) {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem("merctoken");
        if (!token) {
          router.push("/merchant/login");
          return;
        }

        const response = await axios.get(`${apiBaseUrl}/product/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const productData = response.data;
        setProduct(productData);
        setSelectedImage(productData.product_image.split(",")[0]);
      } catch (err) {
        console.error("Error fetching product:", err);
        if (err.response?.status === 401) {
          router.push("/merchant/login");
        } else {
          setError("Failed to load product details. Please try again later.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetails();
  }, [params.id, router]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }

    try {
      setIsDeleting(true);
      const token = localStorage.getItem("merctoken");
      if (!token) {
        router.push("/merchant/login");
        return;
      }

      const response = await axios.delete(`${apiBaseUrl}/productmerchant/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        router.push("/merchant/products");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      if (error.response?.status === 401) {
        router.push("/merchant/login");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-lg font-semibold text-gray-700">{error || "Product not found."}</p>
          <button
            onClick={() => router.push("/merchant/products")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const images = product.product_image?.split(",") || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.push("/merchant/products")}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Products
          </button>
          <div className="flex space-x-4">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Edit Product
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={`px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors ${
                isDeleting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isDeleting ? 'Deleting...' : 'Delete Product'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left Section: Images */}
            <div className="p-6 bg-gray-50">
              {/* Main Image */}
              <div className="mb-6">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-white">
                  <img
                    src={selectedImage}
                    alt={product.product_name}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              {/* Thumbnails */}
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(img)}
                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                      selectedImage === img ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Right Section: Details */}
            <div className="p-6 space-y-6">
              {/* Product Title and Status */}
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{product.product_name}</h1>
                  <p className="text-gray-600 mt-2">{product.short_description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  product.status === 'active' ? 'bg-green-100 text-green-800' :
                  product.status === 'inactive' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {product.status || 'Active'}
                </span>
              </div>

              {/* Product Information Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Product ID</h3>
                  <p className="mt-1 text-sm text-gray-900">{product.product_id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">SKU</h3>
                  <p className="mt-1 text-sm text-gray-900">{product.sku}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Category</h3>
                  <p className="mt-1 text-sm text-gray-900">{product.category}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Brand</h3>
                  <p className="mt-1 text-sm text-gray-900">{product.brand}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Gender</h3>
                  <p className="mt-1 text-sm text-gray-900">{product.gender}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Created At</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(product.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tag.split(',').map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Colors and Sizes */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Available Colors</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Available Sizes</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
              </div>

              {/* Pricing */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Price</h3>
                    <p className="text-2xl font-bold text-blue-600">₹{product.final_price}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
