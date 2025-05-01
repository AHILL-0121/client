"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation"; // Import useRouter for navigation

export default function MerchantProductDetails({ params }) {
  if (!params || !params.id) {
    throw new Error("Params or ID is undefined");
  }

  const { id } = params; // Extract dynamic segment `id`
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const router = useRouter(); // Initialize router for navigation

  useEffect(() => {
    // Fetch product details from the API
    axios
      .get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/Adminsingleproduct/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })
      .then((response) => {
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
          Colors: productData.colors, // Assuming colors is an array
          Sizes: productData.sizes, // Assuming sizes is an array
        });
        setSelectedImage(productData.product_image.split(",")[0]); // Set the initial main image
        setLoading(false);
      })
      .catch((err) => {
        setError("The product is unavailable at the moment");
        setLoading(false);
        console.error("Error fetching product:", err);
      });
  }, [id]);

  const handleDeleteProduct = async (productId) => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login"); // Redirect if no token found
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/productadmin/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        console.log("Product deleted successfully");
        router.push("/admin/all_products"); // Redirect after deletion
      } else {
        console.error("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-semibold">
        Loading product details...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-semibold text-red-500">
        {error || "Product not found."}
      </div>
    );
  }

  const images = product.ProductImage?.split(",") || [];

  return (
    <div className="bg-gray-50 py-12 px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Section: Images */}
          <div className="p-6">
            {/* Main Image */}
            <div className="mb-4">
              <img
                src={selectedImage}
                alt={product.ProductName}
                className="w-full h-[600px] object-contain rounded-lg border"
              />
            </div>
            {/* Thumbnails */}
            <div className="flex space-x-3 overflow-auto">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Thumbnail ${index}`}
                  className={`w-20 h-20 object-contain rounded-md border cursor-pointer ${
                    selectedImage === img ? "border-blue-500" : "border-gray-300"
                  }`}
                  onClick={() => setSelectedImage(img)}
                />
              ))}
            </div>
          </div>

          {/* Right Section: Details */}
          <div className="p-6 space-y-6">
            {/* Product Title */}
            <h1 className="text-3xl font-bold text-gray-800">
              {product.ProductName}
            </h1>
            <p className="text-gray-600">{product.ShortDescription}</p>

            {/* Product Information Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-gray-700">Product ID:</p>
                <p className="text-gray-600">{product.ProductID}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Category:</p>
                <p className="text-gray-600">{product.Gender}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Tags:</p>
                <p className="text-gray-600">{product.Tag}</p>
              </div>
            </div>

            {/* Colors */}
            <div>
              <p className="font-medium text-gray-700">Available Colors:</p>
              <div className="flex space-x-2">
                {product.Colors.map((color, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-700"
                  >
                    {color}
                  </span>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <p className="font-medium text-gray-700">Available Sizes:</p>
              <div className="flex space-x-2">
                {product.Sizes.map((size, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-700"
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="font-medium text-gray-700">Description:</p>
              <p className="text-gray-600">{product.Description}</p>
            </div>

            {/* Pricing */}
            <div className="flex justify-between items-center bg-gray-100 rounded-md p-4">
              <div>
                <p className="font-medium text-gray-700">Price:</p>
                <p className="text-lg font-semibold text-blue-600">
                  ₹{product.Price}
                </p>
              </div>
            </div>

            {/* Delete Button */}
            <button
              onClick={() => handleDeleteProduct(product.ProductID)}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Delete Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
