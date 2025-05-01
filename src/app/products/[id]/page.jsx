"use client"; // Ensure this file is a client component
import { useState, useEffect } from "react";
import axios from "axios";
import Popup from "@/component/Landing_Page/CheckoutPage/Popup";
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ProductDetails({ params }) {
  const [popupMessage, setPopupMessage] = useState(""); // State to control popup message
  const [showPopup, setShowPopup] = useState(false); // State to control popup visibility
  const [reviews, setReviews] = useState([]); // State to store product reviews
  const [userReview, setUserReview] = useState({ rating: 5, comment: "" }); // State for new review
  const [editingReview, setEditingReview] = useState(null); // State for editing review
  const [averageRating, setAverageRating] = useState(0); // State for average rating
  const [isSubmittingReview, setIsSubmittingReview] = useState(false); // State to track review submission
  const [userCanReview, setUserCanReview] = useState(true); // State to check if user can review
  const [sortBy, setSortBy] = useState("newest"); // State for review sorting
  const [filterRating, setFilterRating] = useState(0); // State for rating filter
  const [currentPage, setCurrentPage] = useState(1); // State for pagination
  const reviewsPerPage = 5; // Number of reviews per page

const closePopup = () => {
    setShowPopup(false);
  };

  if (!params || !params.id) {
    throw new Error("Params or ID is undefined");
  }

  const { id } = params; // Extract dynamic segment `id`
  const [product, setProduct] = useState(null); // State to hold product data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [activeTab, setActiveTab] = useState("description"); // State to switch tabs
  const [mainImage, setMainImage] = useState(""); // State for main displayed image
  const [selectedSize, setSelectedSize] = useState(""); // State to track selected size
  const [selectedColor, setSelectedColor] = useState(""); // State to track selected color
  const [hasStock, setHasStock] = useState(true); // State to check if product has stock
  const [stockInfo, setStockInfo] = useState(null); // State to store stock info

  useEffect(() => {
    // Fetch product details from the API
    axios
      .get(`${apiBaseUrl}/product/${id}`)
      .then((response) => {
        setProduct(response.data);
        const images = response.data.product_image.split(","); // Get the images array
        setMainImage(images[0]); // Set the first image as the default main image

        const colorAndSize = response.data.color_and_size || {};
        const hasStockAvailable = Object.values(colorAndSize).some(
          (sizes) => sizes.length > 0
        );
        setHasStock(hasStockAvailable);

        if (hasStockAvailable) {
          const firstColor = Object.keys(colorAndSize)[0];
          setSelectedColor(firstColor);
          setSelectedSize(colorAndSize[firstColor][0]);
        }

        setLoading(false);
      })
      .catch((err) => {
        setError("The product is unavailable at the moment");
        setLoading(false);
        console.error(err);
      });
  }, [id]);

  // Fetch stock information from the /stock_no API
  useEffect(() => {
    if (selectedColor && selectedSize) {
      axios
        .get(`${apiBaseUrl}/stock_no`, {
          params: {
            product_id: product.product_id,
            color: selectedColor,
            size: selectedSize,
          },
        })
        .then((response) => {
          setStockInfo(response.data);
        })
        .catch((err) => {
          console.error("Error fetching stock information:", err);
        });
    }
  }, [selectedColor, selectedSize, product?.product_id]);

  // Fetch reviews for the product
  useEffect(() => {
    if (id) {
      fetchReviews();
    }
  }, [id]);

  // Function to fetch reviews
  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${apiBaseUrl}/review/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data && Array.isArray(response.data)) {
        // Sort reviews based on selected option
        let sortedReviews = [...response.data];
        switch (sortBy) {
          case "newest":
            sortedReviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
          case "oldest":
            sortedReviews.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            break;
          case "highest":
            sortedReviews.sort((a, b) => b.rating - a.rating);
            break;
          case "lowest":
            sortedReviews.sort((a, b) => a.rating - b.rating);
            break;
          default:
            break;
        }
        
        setReviews(sortedReviews);
        
        // Calculate average rating
        if (sortedReviews.length > 0) {
          const totalRating = sortedReviews.reduce((sum, review) => sum + review.rating, 0);
          setAverageRating(totalRating / sortedReviews.length);
        }
        
        // Check if user has already submitted a review
        const userHasReview = sortedReviews.some(review => review.user_id === localStorage.getItem("userId"));
        setUserCanReview(!userHasReview);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setPopupMessage("Failed to load reviews. Please try again.");
      setShowPopup(true);
    }
  };

  // Calculate pagination
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const filteredReviews = reviews.filter(review => filterRating === 0 || review.rating === filterRating);
  const currentReviews = filteredReviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterRating, sortBy]);

  // Fetch reviews when sort or filter changes
  useEffect(() => {
    fetchReviews();
  }, [sortBy]);

  // Function to submit a new review
  const submitReview = async () => {
    if (!userReview.comment.trim()) {
      setPopupMessage("Please enter a review comment");
      setShowPopup(true);
      return;
    }

    setIsSubmittingReview(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        `${apiBaseUrl}/review`,
        {
          product_id: id, // Send as string, no need to convert to integer
          rating: userReview.rating,
          review_text: userReview.comment
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        setPopupMessage("Review submitted successfully!");
        setShowPopup(true);
        setUserReview({ rating: 5, comment: "" });
        fetchReviews(); // Refresh reviews
        setUserCanReview(false);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      setPopupMessage(error.response?.data?.error || "Failed to submit review. Please try again.");
      setShowPopup(true);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Function to update a review
  const updateReview = async (reviewId) => {
    if (!editingReview.comment.trim()) {
      setPopupMessage("Please enter a review comment");
      setShowPopup(true);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.put(
        `${apiBaseUrl}/review/${reviewId}`,
        {
          rating: editingReview.rating,
          review_text: editingReview.comment
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        setPopupMessage("Review updated successfully!");
        setShowPopup(true);
        setEditingReview(null);
        fetchReviews(); // Refresh reviews
      }
    } catch (error) {
      console.error("Error updating review:", error);
      setPopupMessage(error.response?.data?.error || "Failed to update review. Please try again.");
      setShowPopup(true);
    }
  };

  // Function to delete a review
  const deleteReview = async (reviewId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.delete(`${apiBaseUrl}/review/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.message === "review deleted") {
        setPopupMessage("Review deleted successfully!");
        setShowPopup(true);
        fetchReviews(); // Refresh reviews
        setUserCanReview(true);
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      setPopupMessage(error.response?.data?.error || "Failed to delete review. Please try again.");
      setShowPopup(true);
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

  // Hardcoded elements for missing API data
  const hardcoded = {
    categories: "Women, Polo, Casual",
    tags: "Modern, Design, Cotton",
  };

  const addToCart = async () => {
    if (!selectedSize || !selectedColor) {
      setPopupMessage("Please select both size and color.");
        setShowPopup(true);
      return;
    }

    try {
      const token = localStorage.getItem("authToken"); // Retrieve the JWT token from localStorage

      const response = await axios.post(
        `${apiBaseUrl}/cart/add`,
        {
          product_id: product.product_id,
          size: selectedSize,
          color: selectedColor,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        }
      );

      if (response.data.success) {
        setPopupMessage("Product added to cart!");
        setShowPopup(true);
      } else {
        setPopupMessage("Already in cart");
        setShowPopup(true);
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
      setPopupMessage("An error occurred. Please try again.");
        setShowPopup(true);
    }
  };

  const addToWishlist = async () => {
    try {
      const token = localStorage.getItem("authToken"); // Retrieve the JWT token from localStorage

      const response = await axios.post(
        `${apiBaseUrl}/wishlist/add`,
        {
          product_id: product.product_id
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        }
      );

      if (response.data.success) {
        setPopupMessage("Product added to wishlist!");
        setShowPopup(true);
      } else {
        setPopupMessage("Failed to add product to wishlist.");
        setShowPopup(true);
      }
    } catch (error) {
      console.error("Error adding product to wishlist:", error);
      setPopupMessage("An error occurred. Please try again.");
        setShowPopup(true);
    }
  };

  const images = product.product_image.split(","); // Split image URLs

  // Determine the stock message based on stock information
  const stockMessage = () => {
    if (stockInfo) {
      if (stockInfo.stock > stockInfo.threshold) {
        return "available"; // No message if stock is greater than threshold
      }
      if (stockInfo.stock < 5) {
        return `${stockInfo.stock} left`; // Show exact stock if less than 5
      }
      return "Few left"; // Show "Few left" if stock is below threshold
    }
    return null; // Default to no message if stock info is not available
  };

  return (
    <>
    <div className="bg-white min-h-screen">
      {/* Main Section */}
      <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:space-x-8 space-y-8 lg:space-y-0">
          {/* Product Image with Thumbnails */}
          <div className="lg:w-1/2 relative">
            {/* Main Image Container with proper aspect ratio */}
            <div className="relative overflow-hidden rounded-xl shadow-sm bg-gray-50">
              <div className="aspect-[3/4] w-full">
                <img
                  src={mainImage}
                  alt={product.product_name}
                  className="w-full h-full object-cover object-center transition-all duration-300"
                />
              </div>
              {product.discount > 0 && (
                <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                  {product.discount}% OFF
                </span>
              )}
            </div>

            {/* Thumbnails in scrollable container for mobile */}
            <div className="flex mt-4 space-x-2 overflow-x-auto pb-2 snap-x scrollbar-hide">
              {images.map((img, index) => (
                <div 
                  key={index}
                  className="snap-start shrink-0"
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${index}`}
                    onClick={() => setMainImage(img)}
                    className={`w-16 sm:w-20 h-16 sm:h-20 object-cover rounded-lg cursor-pointer transition-all duration-200 hover:opacity-90 ${
                      mainImage === img ? "ring-2 ring-[#024E82] shadow-md" : "border border-gray-200"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="lg:w-1/2 space-y-5">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 leading-tight">
              {product.product_name}
            </h1>
            
            <div className="flex items-center space-x-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${i < Math.round(averageRating) ? "text-yellow-400" : "text-gray-300"}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-600 font-medium">
                {averageRating.toFixed(1)} ({reviews.length} reviews)
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <p className="text-2xl sm:text-3xl font-bold text-[#024E82]">
                ₹{product.final_price}
              </p>
              {product.discount > 0 && (
                <>
                  <p className="text-base sm:text-lg text-gray-400 line-through">
                    ₹{product.original_price}
                  </p>
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {product.discount}% OFF
                  </span>
                </>
              )}
            </div>
            
            <div className="h-px bg-gray-100 w-full my-2"></div>
            
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {product.short_description}
            </p>

            {hasStock && (
              <div className="space-y-5">
                {/* Color Selector - Redesigned with visual color options */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Color
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {Object.keys(product.color_and_size).map((color, index) => (
                      <button 
                        key={index}
                        onClick={() => {
                          setSelectedColor(color);
                          setSelectedSize(product.color_and_size[color][0] || "");
                        }}
                        className={`relative w-10 h-10 rounded-full transition-all duration-200
                          ${selectedColor === color 
                            ? 'ring-2 ring-offset-2 ring-[#024E82] scale-110' 
                            : 'ring-1 ring-gray-200'
                          }`}
                        style={{
                          backgroundColor: color.toLowerCase() === 'white' 
                            ? '#ffffff' 
                            : color.toLowerCase() === 'black' 
                              ? '#000000' 
                              : color.toLowerCase() === 'red'
                                ? '#e53e3e'
                                : color.toLowerCase() === 'blue'
                                  ? '#3182ce'
                                  : color.toLowerCase() === 'green'
                                    ? '#38a169'
                                    : color.toLowerCase() === 'yellow'
                                      ? '#ecc94b'
                                      : '#' + Math.floor(Math.random()*16777215).toString(16)
                        }}
                      >
                        {color.toLowerCase() === 'white' && (
                          <div className="absolute inset-0 rounded-full border border-gray-300"></div>
                        )}
                        {selectedColor === color && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <svg className={`w-4 h-4 ${color.toLowerCase() === 'white' ? 'text-black' : 'text-white'}`} viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Selected: {selectedColor}</p>
                </div>

                {/* Size Selector - Redesigned with larger buttons */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Size
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.color_and_size[selectedColor]?.map((size, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 flex items-center justify-center border rounded-md transition-all duration-200 ${
                          selectedSize === size 
                            ? 'bg-[#024E82] text-white border-[#024E82]' 
                            : 'bg-white text-gray-700 border-gray-300 hover:border-[#024E82]'
                        }`}
                      >
                        <span className="text-sm font-medium">{size}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stock Message */}
                {stockMessage() && (
                  <p className={`text-sm font-medium ${stockMessage() === 'available' ? 'text-green-500' : 'text-amber-500'}`}>
                    {stockMessage() === 'available' ? '✓ In stock' : `⚠ Only ${stockMessage()}`}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  {/* Add to Cart Button */}
                  <button
                    className="flex-1 py-3.5 px-6 text-white font-medium bg-[#024E82] rounded-lg transition transform hover:bg-[#023e68] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#024E82] focus:ring-opacity-50 flex items-center justify-center gap-2"
                    onClick={addToCart}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    </svg>
                    Add to Cart
                  </button>
                  
                  {/* Add to Wishlist */}
                  <button
                    className="sm:flex-initial py-3.5 px-6 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 flex items-center justify-center gap-2"
                    onClick={addToWishlist}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    Wishlist
                  </button>
                </div>
              </div>
            )}

            {!hasStock && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-red-600 font-medium flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Currently out of stock
                </p>
              </div>
            )}

            {/* Product details in collapsible sections */}
            <div className="mt-8 space-y-4 border-t border-gray-100 pt-6">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-base font-semibold text-gray-800 mb-2">Product Description</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-2">Product Details</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex">
                    <span className="font-medium w-24">Brand:</span>
                    <span>{product.brand || 'Unknown'}</span>
                  </li>
                  <li className="flex">
                    <span className="font-medium w-24">Category:</span>
                    <span>{hardcoded.categories}</span>
                  </li>
                  <li className="flex">
                    <span className="font-medium w-24">Style:</span>
                    <span>{product.style || 'Contemporary'}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Reviews Section - Modernized */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Customer Reviews</h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center">
                <label className="mr-2 text-sm text-gray-600">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border rounded-md px-2 py-1.5 text-sm bg-white focus:ring-2 focus:ring-[#024E82] focus:border-[#024E82]"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Rated</option>
                  <option value="lowest">Lowest Rated</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="mr-2 text-sm text-gray-600">Filter by:</label>
                <select
                  value={filterRating}
                  onChange={(e) => setFilterRating(Number(e.target.value))}
                  className="border rounded-md px-2 py-1.5 text-sm bg-white focus:ring-2 focus:ring-[#024E82] focus:border-[#024E82]"
                >
                  <option value={0}>All Ratings</option>
                  <option value={5}>5 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={2}>2 Stars</option>
                  <option value={1}>1 Star</option>
                </select>
              </div>
            </div>
          </div>

          {/* Rating Summary - Modernized */}
          <div className="bg-gray-50 p-4 sm:p-6 rounded-xl mb-8">
            <div className="flex items-center mb-4">
              <div className="text-3xl font-bold mr-3 text-gray-800">{averageRating.toFixed(1)}</div>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${i < Math.round(averageRating) ? "text-yellow-400" : "text-gray-300"}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="ml-2 text-gray-600">Based on {reviews.length} reviews</span>
            </div>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviews.filter(r => r.rating === rating).length;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center">
                    <span className="w-12 text-sm text-gray-600">{rating} stars</span>
                    <div className="flex-1 h-2 mx-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-2 bg-yellow-400 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="w-12 text-sm text-gray-600 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Review Form */}
          {userCanReview && (
            <div className="bg-gray-50 p-6 rounded-xl mb-8 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Write a Review</h3>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex space-x-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserReview({...userReview, rating: star})}
                      className={`text-2xl focus:outline-none transition-all duration-150 transform hover:scale-110 ${
                        star <= userReview.rating ? "text-yellow-400" : "text-gray-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                <textarea
                  value={userReview.comment}
                  onChange={(e) => setUserReview({...userReview, comment: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-3 h-32 focus:ring-2 focus:ring-[#024E82] focus:border-transparent resize-none"
                  placeholder="Share your experience with this product..."
                ></textarea>
              </div>
              <button
                onClick={submitReview}
                disabled={isSubmittingReview}
                className="bg-[#024E82] text-white px-5 py-2.5 rounded-lg hover:bg-[#023e68] focus:outline-none focus:ring-2 focus:ring-[#024E82] focus:ring-opacity-50 transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingReview ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : "Submit Review"}
              </button>
            </div>
          )}

          {/* Reviews List */}
          {currentReviews.length > 0 ? (
            <div className="space-y-6">
              {currentReviews.map((review) => (
                <div key={review.id} className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100 mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center mb-3">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-2 text-sm font-medium text-gray-700">
                          {review.user_name}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          {review.created_at 
                            ? new Date(review.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })
                            : 'No date available'}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{review.review_text}</p>
                    </div>
                    {review.user_id === localStorage.getItem("userId") && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingReview({ id: review.id, rating: review.rating, comment: review.review_text })}
                          className="text-[#024E82] hover:text-[#023e68] text-sm flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => deleteReview(review.id)}
                          className="text-red-600 hover:text-red-800 text-sm flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 p-8 rounded-lg text-center border border-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <p className="text-gray-600 mb-2">No reviews match your selected criteria</p>
              <p className="text-sm text-gray-500">Try adjusting your filters or be the first to leave a review!</p>
            </div>
          )}

          {/* Edit Review Form */}
          {editingReview && (
            <div className="bg-gray-50 p-6 rounded-xl mb-8 border border-gray-100 shadow-sm mt-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Edit Your Review</h3>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex space-x-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditingReview({...editingReview, rating: star})}
                      className={`text-2xl focus:outline-none transition-all duration-150 transform hover:scale-110 ${
                        star <= editingReview.rating ? "text-yellow-400" : "text-gray-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                <textarea
                  value={editingReview.comment}
                  onChange={(e) => setEditingReview({...editingReview, comment: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-3 h-32 focus:ring-2 focus:ring-[#024E82] focus:border-transparent resize-none"
                  placeholder="Share your experience with this product..."
                ></textarea>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setEditingReview(null)}
                  className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateReview(editingReview.id)}
                  className="bg-[#024E82] text-white px-5 py-2.5 rounded-lg hover:bg-[#023e68] focus:outline-none focus:ring-2 focus:ring-[#024E82] focus:ring-opacity-50 transition-colors duration-200"
                >
                  Update Review
                </button>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                {[...Array(totalPages)].map((_, i) => {
                  // Show first page, last page, and pages around current page
                  if (i === 0 || i === totalPages - 1 || (i >= currentPage - 2 && i <= currentPage + 2)) {
                    return (
                      <button
                        key={i}
                        onClick={() => paginate(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === i + 1
                            ? "z-10 bg-[#024E82] border-[#024E82] text-white"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {i + 1}
                      </button>
                    );
                  }
                  
                  // Show ellipsis for skipped pages
                  if (i === 1 && currentPage > 3) {
                    return <span key="start-ellipsis" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>;
                  }
                  
                  if (i === totalPages - 2 && currentPage < totalPages - 3) {
                    return <span key="end-ellipsis" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>;
                  }
                  
                  return null;
                })}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
    {showPopup && (
        <Popup message={popupMessage} onClose={closePopup} />
      )}
      </>
  );
}
