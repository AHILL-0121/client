"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import Popup from "@/component/Landing_Page/CheckoutPage/Popup";
import { motion } from "framer-motion";
import { FiShoppingBag, FiHeart, FiFilter, FiX } from "react-icons/fi";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

function ProductListContent() {
  const [popupMessage, setPopupMessage] = useState(""); // State to control popup message
  const [showPopup, setShowPopup] = useState(false); // State to control popup visibility
  const [productRatings, setProductRatings] = useState({}); // State to store product ratings
  const [loading, setLoading] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [animateProducts, setAnimateProducts] = useState(false);

  const closePopup = () => {
    setShowPopup(false);
  };
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);

  // Categories list
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
    "Uniform"
  ];

  // Colors with their hex values
  const colorOptions = [
    { name: "Black", hex: "#000000" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Red", hex: "#FF0000" },
    { name: "Blue", hex: "#0000FF" },
    { name: "Green", hex: "#008000" },
    { name: "Yellow", hex: "#FFFF00" },
    { name: "Purple", hex: "#800080" },
    { name: "Pink", hex: "#FFC0CB" },
    { name: "Orange", hex: "#FFA500" },
    { name: "Gray", hex: "#808080" },
    { name: "Brown", hex: "#A52A2A" },
    { name: "Navy", hex: "#000080" }
  ];

  // Size options
  const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

  // Initialize filters from URL parameters
  const [filters, setFilters] = useState({
    category: searchParams.get("category") ? searchParams.get("category").split(",") : [],
    minPrice: parseInt(searchParams.get("minPrice") || 0),
    maxPrice: parseInt(searchParams.get("maxPrice") || 10000),
    size: searchParams.get("size") ? searchParams.get("size").split(",") : [],
    color: searchParams.get("color") ? searchParams.get("color").split(",") : [],
    gender: searchParams.get("gender") || "",
  });
  

  // Update URL when filters change
  useEffect(() => {
    const queryParams = new URLSearchParams();
  
    if (filters.category.length > 0) queryParams.set("category", filters.category.join(","));
    if (filters.minPrice > 0) queryParams.set("minPrice", filters.minPrice);
    if (filters.maxPrice < 10000) queryParams.set("maxPrice", filters.maxPrice);
    if (filters.size.length > 0) queryParams.set("size", filters.size.join(","));
    if (filters.color.length > 0) queryParams.set("color", filters.color.join(","));
    if (filters.gender) queryParams.set("gender", filters.gender);
  
    router.replace(`/products?${queryParams.toString()}`, { scroll: false });
  }, [filters, router]);
  

  // Fetch products based on filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken"); // Retrieve the JWT token from localStorage

        const queryParams = new URLSearchParams({
          ...(filters.category.length > 0 && { category: filters.category.join(",") }),
          minPrice: filters.minPrice.toString(),
          maxPrice: filters.maxPrice.toString(),
          ...(filters.size.length > 0 && { size: filters.size.join(",") }),
          ...(filters.color.length > 0 && { color: filters.color.join(",") }),
          ...(filters.gender && { gender: filters.gender }),
        }).toString();

        const response = await axios.get(`${apiBaseUrl}/products?${queryParams}`, {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        });

        const transformedProducts = response.data.map((product) => ({
          ...product,
          product_image: `${apiBaseUrl}/CoverImages/${product.product_image.split("/").pop()}`, // Update the image URL with the backend URL
        }));

        setProducts(transformedProducts);
        setLoading(false);
        // Delay animation to ensure DOM elements are rendered
        setTimeout(() => {
          setAnimateProducts(true);
        }, 100);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  // Fetch product ratings
  useEffect(() => {
    const fetchProductRatings = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/products/ratings`);
        setProductRatings(response.data);
      } catch (error) {
        console.error("Error fetching product ratings:", error);
      }
    };

    fetchProductRatings();
  }, []);

  const toggleSidebar = () => {
    setSidebarVisible((prevState) => !prevState);
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
  
    if (type === "checkbox") {
      if (name === "category") {
        const updatedCategories = checked
          ? [...filters.category, value]
          : filters.category.filter((category) => category !== value);
        setFilters((prevFilters) => ({ ...prevFilters, category: updatedCategories }));
      } else if (name === "size") {
        const updatedSizes = checked
          ? [...filters.size, value]
          : filters.size.filter((size) => size !== value);
        setFilters((prevFilters) => ({ ...prevFilters, size: updatedSizes }));
      } else if (name === "color") {
        const updatedColors = checked
          ? [...filters.color, value]
          : filters.color.filter((color) => color !== value);
        setFilters((prevFilters) => ({ ...prevFilters, color: updatedColors }));
      }
    } else if (type === "number") {
      setFilters((prevFilters) => ({ ...prevFilters, [name]: parseInt(value) || 0 }));
    } else {
      setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
    }
    
    // Reset animation state to trigger new animation
    setAnimateProducts(false);
  };
  

  const addToCart = async (productId) => {
    try {
      const token = localStorage.getItem("authToken"); // Retrieve the JWT token from localStorage
      if (!token) {
        setPopupMessage("Please login");
        setShowPopup(true);
        return;
      }
      const response = await axios.post(
        `${apiBaseUrl}/cart/add`,
        {
          product_id: productId,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}` // Include the token in the Authorization header
          },
        }
      );

      if (response.data.success) {
        setPopupMessage("Added to cart successfully");
        setShowPopup(true);
      } else {
        setPopupMessage("Already in cart");
        setShowPopup(true);
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
      setPopupMessage("Failed to add to cart");
      setShowPopup(true);
    }
  };

  const addToWishlist = async (productId) => {
    try {
      const token = localStorage.getItem("authToken"); // Retrieve the JWT token from localStorage
      if (!token) {
        setPopupMessage("Please login.");
        setShowPopup(true);
        return;
      }
      const response = await axios.post(
        `${apiBaseUrl}/wishlist/add`,
        { product_id: productId },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        }
      );

      if (response.data.success) {
        setPopupMessage("Added to wishlist successfully");
        setShowPopup(true);
      } else {
        setPopupMessage("Already in wishlist");
        setShowPopup(true);
      }
    } catch (error) {
      console.error("Error adding product to wishlist:", error);
      setPopupMessage("Failed to add to wishlist");
      setShowPopup(true);
    }
  };

  // Helper function to render star rating
  const renderStarRating = (productId) => {
    const rating = productRatings[productId]?.average_rating || 0;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          i < fullStars ? 
            <AiFillStar key={i} className="w-4 h-4 text-yellow-400" /> :
            (i === fullStars && hasHalfStar) ?
              <AiFillStar key={i} className="w-4 h-4 text-yellow-300" /> :
              <AiOutlineStar key={i} className="w-4 h-4 text-gray-300" />
        ))}
        <span className="ml-1 text-sm text-gray-600">
          {productRatings[productId]?.review_count > 0 
            ? `(${productRatings[productId]?.review_count})` 
            : ''}
        </span>
      </div>
    );
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#024E82]"></div>
      </div>
    );
  }
  return (
    <>
    <div className="flex flex-col lg:flex-row relative pb-10">
      {/* Mobile Filter Bar - Fixed below navbar */}
      <div className="lg:hidden fixed top-[60px] left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center gap-2 bg-[#024E82] text-white w-full py-3 px-4"
        >
          <FiFilter className="w-5 h-5" />
          <span className="font-medium">Filter Products</span>
        </button>
      </div>
  
      {/* Sidebar */}
      <aside
        className={`fixed lg:relative top-0 left-0 z-40 w-[85%] sm:w-[60%] md:w-[45%] lg:w-[280px] xl:w-[320px] bg-white border-r border-gray-200 h-screen lg:min-h-screen p-5 sm:p-6 transition-all duration-300 ease-in-out ${
          sidebarVisible ? 'translate-x-0 shadow-xl lg:shadow-none' : '-translate-x-full'
        } lg:translate-x-0 overflow-y-auto`}
      >
        <div className="flex justify-between items-center mb-6 sticky top-0 pt-1 bg-white z-10">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Filters</h3>
          
          {/* Close button for mobile sidebar */}
          <button 
            onClick={toggleSidebar} 
            className="lg:hidden bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-full transition-colors duration-200"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
  
        <div className="pb-20 space-y-6">
          {/* Category Filter */}
          <div className="border-b border-gray-200 pb-6">
            <h4 className="font-semibold text-gray-800 mb-3">Category</h4>
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2">
              {categoriesList.map((category) => (
                <div key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`category-${category}`}
                    name="category"
                    value={category}
                    onChange={handleFilterChange}
                    checked={filters.category.includes(category)}
                    className="form-checkbox h-4 w-4 text-[#024E82] rounded focus:ring-[#024E82] border-gray-300"
                  />
                  <label htmlFor={`category-${category}`} className="ml-2 text-sm text-gray-700 cursor-pointer">{category}</label>
                </div>
              ))}
            </div>
          </div>
  
          {/* Color Filter */}
          <div className="border-b border-gray-200 pb-6">
            <h4 className="font-semibold text-gray-800 mb-3">Color</h4>
            <div className="grid grid-cols-4 gap-3 mt-2">
              {colorOptions.map((color) => (
                <div key={color.name} className="flex flex-col items-center gap-1">
                  <div 
                    className={`relative w-8 h-8 rounded-full cursor-pointer transition-transform ${
                      filters.color.includes(color.name) ? 'ring-2 ring-offset-2 ring-[#024E82] scale-110' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    onClick={() => {
                      const updatedColors = filters.color.includes(color.name)
                        ? filters.color.filter(c => c !== color.name)
                        : [...filters.color, color.name];
                      setFilters(prev => ({ ...prev, color: updatedColors }));
                    }}
                  >
                    {color.name === "White" && (
                      <div className="absolute inset-0 rounded-full border border-gray-300"></div>
                    )}
                    {filters.color.includes(color.name) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className={`w-4 h-4 ${color.name === "White" || color.name === "Yellow" ? 'text-black' : 'text-white'}`} viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-600 truncate w-full text-center">{color.name}</span>
                </div>
              ))}
            </div>
            {filters.color.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {filters.color.map(selectedColor => (
                  <span 
                    key={selectedColor}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800"
                  >
                    {selectedColor}
                    <button 
                      className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
                      onClick={() => {
                        setFilters(prev => ({
                          ...prev,
                          color: prev.color.filter(c => c !== selectedColor)
                        }));
                      }}
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                ))}
                {filters.color.length > 1 && (
                  <button
                    className="text-xs text-[#024E82] hover:text-[#023e68] font-medium"
                    onClick={() => setFilters(prev => ({...prev, color: []}))}
                  >
                    Clear all
                  </button>
                )}
              </div>
            )}
          </div>
  
          {/* Price Range */}
          <div className="border-b border-gray-200 pb-6">
            <h4 className="font-semibold text-gray-800 mb-3">Price Range</h4>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="Min"
                  className="w-full p-2 pl-6 border rounded-md focus:ring-[#024E82] focus:border-[#024E82]"
                />
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
              </div>
              <span className="text-gray-500">to</span>
              <div className="relative flex-1">
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="Max"
                  className="w-full p-2 pl-6 border rounded-md focus:ring-[#024E82] focus:border-[#024E82]"
                />
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
              </div>
            </div>
          </div>
  
          {/* Size Filter */}
          <div className="border-b border-gray-200 pb-6">
            <h4 className="font-semibold text-gray-800 mb-3">Size</h4>
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map((size) => (
                <div 
                  key={size}
                  onClick={() => {
                    const updatedSizes = filters.size.includes(size)
                      ? filters.size.filter(s => s !== size)
                      : [...filters.size, size];
                    setFilters(prev => ({ ...prev, size: updatedSizes }));
                  }}
                  className={`w-10 h-10 flex items-center justify-center border rounded-md cursor-pointer transition-all ${
                    filters.size.includes(size) 
                      ? 'bg-[#024E82] text-white border-[#024E82]' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-[#024E82]'
                  }`}
                >
                  <span className="text-sm font-medium">{size}</span>
                </div>
              ))}
            </div>
          </div>
  
          {/* Gender Filter */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Gender</h4>
            <select
              name="gender"
              value={filters.gender}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-md focus:ring-[#024E82] focus:border-[#024E82]"
            >
              <option value="">All Genders</option>
              <option value="Male">Men</option>
              <option value="Female">Women</option>
              <option value="Unisex">Unisex</option>
              <option value="Boys">Boys</option>
              <option value="Girls">Girls</option>
            </select>
          </div>
        </div>
      </aside>
  
      {/* Overlay to close sidebar on mobile */}
      {sidebarVisible && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" 
          onClick={toggleSidebar}
        ></div>
      )}
  
      {/* Main Content - Add extra padding top for mobile filter bar */}
      <main className="flex-1 p-4 pt-[110px] sm:pt-[110px] md:pt-[110px] lg:pt-4 sm:p-6 md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Products</h1>
          <p className="text-gray-600 mt-1">
            {products.length} {products.length === 1 ? 'item' : 'items'} found
          </p>
        </div>
        
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={animateProducts ? "visible" : "hidden"}
        >
          {products.map((product) => (
            <motion.div
              key={product.product_id}
              variants={itemVariants}
              className="group bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
            >
              <Link href={`/products/${product.product_id}`} className="block relative overflow-hidden">
                <div className="aspect-[3/4] overflow-hidden bg-gray-50">
                  <img
                    src={product.product_image}
                    alt={product.product_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="absolute top-2 right-2">
                  {product.discount_percentage > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      {Math.round(product.discount_percentage)}% OFF
                    </span>
                  )}
                </div>
              </Link>
              <div className="p-4">
                <div className="min-h-[40px]">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-800 line-clamp-2 group-hover:text-[#024E82] transition-colors">
                    {product.product_name}
                  </h3>
                </div>
                <div className="mt-2">
                  {renderStarRating(product.product_id)}
                </div>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-lg font-bold text-[#024E82]">₹{product.final_price}</span>
                  {product.original_price > product.final_price && (
                    <span className="text-sm text-gray-500 line-through">₹{product.original_price}</span>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    className="flex-1 bg-[#024E82] text-white text-xs sm:text-sm py-2 rounded-md transition-all hover:bg-[#023e68] flex items-center justify-center gap-1"
                    onClick={() => addToCart(product.product_id)}
                  >
                    <FiShoppingBag className="w-4 h-4" />
                    <span>Add to cart</span>
                  </button>
                  <button
                    className="p-2 bg-gray-100 text-gray-700 rounded-md transition-all hover:bg-gray-200"
                    onClick={() => addToWishlist(product.product_id)}
                  >
                    <FiHeart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {products.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <img 
              src="/no-results.svg" 
              alt="No products found" 
              className="w-40 h-40 mb-4 opacity-70"
            />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-500 text-center max-w-md">
              Try adjusting your filters or search criteria to find what you're looking for.
            </p>
          </div>
        )}
      </main>
    </div>
    {showPopup && (
      <Popup message={popupMessage} onClose={closePopup} />
    )}
    </>
  );
}

export default function ProductListPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#024E82]"></div>
      </div>
    }>
      <ProductListContent />
    </Suspense>
  );
}