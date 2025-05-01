"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Popup from "@/component/Landing_Page/CheckoutPage/Popup";

export default function MerchantProductDetails({ params }) {
  const router = useRouter();
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const closePopup = () => {
    setShowPopup(false);
  };

  if (!params || !params.id) {
    throw new Error("Params or ID is undefined");
  }

  const { id } = params;

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem("supervisorToken");
        if (!token) {
          router.push("/supervisor/login");
          return;
        }

        const response = await axios.get(`${apiBaseUrl}/productreq/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const productData = response.data;
        setProduct({
          ProductID: productData.product_id,
          ProductName: productData.product_name,
          Price: Math.round(productData.final_price),
          ProductImage: productData.product_image,
          Tag: productData.tag,
          ShortDescription: productData.short_description,
          Description: productData.description,
          Gender: productData.gender,
          Colors: productData.colors,
          Sizes: productData.sizes,
          Category: productData.category,
          Brand: productData.brand,
          SKU: productData.sku,
          Status: productData.status,
          CreatedAt: productData.created_at,
        });
        setSelectedImage(productData.product_image.split(",")[0]);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetails();
  }, [id, router]);

  const handleApprove = async (productId) => {
    setConfirmAction({
      type: 'approve',
      message: 'Are you sure you want to approve this product?',
      action: async () => {
        try {
          setIsSubmitting(true);
          const token = localStorage.getItem("supervisorToken");
          if (!token) {
            router.push("/supervisor/login");
            return;
          }

          const response = await fetch(`${apiBaseUrl}/sup/product/${productId}/approve`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok) {
            setPopupMessage(`Product ${productId} approved successfully!`);
            setShowPopup(true);
            router.push("/supervisor/product_requests");
          } else {
            throw new Error('Failed to approve product');
          }
        } catch (error) {
          console.error("Error approving product:", error);
          setPopupMessage(`Error approving product ${productId}`);
          setShowPopup(true);
          if (error.response?.status === 401) {
            router.push("/supervisor/login");
          }
        } finally {
          setIsSubmitting(false);
        }
      }
    });
    setShowConfirmDialog(true);
  };

  const handleReject = async (productId) => {
    setConfirmAction({
      type: 'reject',
      message: 'Are you sure you want to reject this product? This action cannot be undone.',
      action: async () => {
        try {
          setIsSubmitting(true);
          const token = localStorage.getItem("supervisorToken");
          if (!token) {
            router.push("/supervisor/login");
            return;
          }

          const response = await fetch(`${apiBaseUrl}/productreqdel/${productId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok) {
            setPopupMessage(`Product ${productId} rejected successfully!`);
            setShowPopup(true);
            router.push("/supervisor/product_requests");
          } else {
            throw new Error('Failed to reject product');
          }
        } catch (error) {
          console.error("Error rejecting product:", error);
          setPopupMessage(`Error rejecting product ${productId}`);
          setShowPopup(true);
          if (error.response?.status === 401) {
            router.push("/supervisor/login");
          }
        } finally {
          setIsSubmitting(false);
        }
      }
    });
    setShowConfirmDialog(true);
  };

  const handleConfirmAction = async () => {
    if (confirmAction) {
      await confirmAction.action();
      setShowConfirmDialog(false);
    }
  };

  const handleCancelAction = () => {
    setShowConfirmDialog(false);
    setConfirmAction(null);
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
            onClick={() => router.push("/admin/product_requests")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Back to Product Requests
          </button>
        </div>
      </div>
    );
  }

  const images = product.ProductImage?.split(",") || [];

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => router.push("/admin/product_requests")}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Product Requests
            </button>
            <div className="flex space-x-4">
              <button
                onClick={() => handleApprove(product.ProductID)}
                disabled={isSubmitting}
                className={`px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Approving...
                  </>
                ) : (
                  'Approve Product'
                )}
              </button>
              <button
                onClick={() => handleReject(product.ProductID)}
                disabled={isSubmitting}
                className={`px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Rejecting...
                  </>
                ) : (
                  'Reject Product'
                )}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Left Section: Images */}
              <div className="p-6 bg-gray-50">
                {/* Main Image */}
                <div className="mb-6">
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-white">
                    <img
                      src={selectedImage}
                      alt={product.ProductName}
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
                    <h1 className="text-3xl font-bold text-gray-900">{product.ProductName}</h1>
                    <p className="text-gray-600 mt-2">{product.ShortDescription}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    product.Status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    product.Status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {product.Status || 'Pending'}
                  </span>
                </div>

                {/* Product Information Grid */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Product ID</h3>
                    <p className="mt-1 text-sm text-gray-900">{product.ProductID}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">SKU</h3>
                    <p className="mt-1 text-sm text-gray-900">{product.SKU}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Category</h3>
                    <p className="mt-1 text-sm text-gray-900">{product.Category}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Brand</h3>
                    <p className="mt-1 text-sm text-gray-900">{product.Brand}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Gender</h3>
                    <p className="mt-1 text-sm text-gray-900">{product.Gender}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Created At</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(product.CreatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.Tag.split(',').map((tag, index) => (
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
                      {product.Colors.map((color, index) => (
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
                      {product.Sizes.map((size, index) => (
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
                  <p className="text-gray-700 whitespace-pre-wrap">{product.Description}</p>
                </div>

                {/* Pricing */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Price</h3>
                      <p className="text-2xl font-bold text-blue-600">₹{product.Price}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Action</h3>
            <p className="text-gray-600 mb-6">{confirmAction?.message}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelAction}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-lg ${
                  confirmAction?.type === 'approve'
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-red-500 text-white hover:bg-red-600'
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Popup */}
      {showPopup && (
        <Popup message={popupMessage} onClose={closePopup} />
      )}
    </>
  );
}
