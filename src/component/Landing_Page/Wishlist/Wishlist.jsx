"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MdOutlineClose } from "react-icons/md";
import { FiShoppingBag, FiHeart, FiTrash2 } from "react-icons/fi";
import axios from "axios";
import Popup from "@/component/Landing_Page/CheckoutPage/Popup";
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const Wishlist = () => {
  const [popupMessage, setPopupMessage] = useState(""); 
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState("success"); // New state for popup type: success, error, info
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState(null);

  const closePopup = () => {
    setShowPopup(false);
  };

  const showNotification = (message, type = "success") => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
  };

  // Get the authToken from localStorage on page load
  useEffect(() => {
    // Get authToken from localStorage
    const token = localStorage.getItem("authToken");
    if (token) {
      setAuthToken(token);
    } else {
      showNotification("Please login to view your wishlist", "error");
    }
  }, []);

  // Fetch wishlist items once the authToken is set
  useEffect(() => {
    if (authToken) {
      setLoading(true);
      axios
        .get(`${apiBaseUrl}/wishlist`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          }
        })
        .then((response) => {
          if (response.data.wishlistItems && response.data.wishlistItems.length > 0) {
            setWishlistItems(response.data.wishlistItems);
          } else {
            setWishlistItems([]);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching wishlist items:", error);
          showNotification("Failed to load wishlist items. Please try again.", "error");
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [authToken]);

  // Remove item from wishlist
  const handleRemoveItem = (productID, productName) => {
    const authToken = localStorage.getItem("authToken");
  
    axios
      .delete(`${apiBaseUrl}/wishlist/${productID}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      .then(() => {
        setWishlistItems((prevItems) => {
          const index = prevItems.findIndex((item) => item.product_id === productID);
          if (index !== -1) {
            const newItems = [...prevItems];
            newItems.splice(index, 1);
            return newItems;
          }
          return prevItems;
        });
        showNotification(`${productName} removed from wishlist`);
      })
      .catch((error) => {
        console.error("Error removing item:", error);
        showNotification("Failed to remove item from wishlist", "error");
      });
  };

  // Add item to cart
  const handleAddToCart = async (productId, productName) => {
    if (!authToken) {
      showNotification("Please login to add items to cart", "error");
      return;
    }

    try {
      const response = await axios.post(
        `${apiBaseUrl}/cart/add`,
        {
          product_id: productId,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          }
        }
      );

      if (response.data.success) {
        showNotification(`${productName} added to cart!`);
      } else if (response.data.message === "Product already in cart") {
        showNotification("This item is already in your cart", "info");
      } else {
        showNotification("Failed to add product to cart", "error");
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
      showNotification("An error occurred. Please try again.", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#024E82]"></div>
      </div>
    );
  }

  return (
    <>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
          <FiHeart className="mr-2 text-red-500" />
          My Wishlist
        </h1>
        {wishlistItems.length > 0 && (
          <p className="text-gray-500 text-sm sm:text-base">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
          </p>
        )}
      </div>

      {wishlistItems.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {/* Header row - visible only on tablet and above */}
          <div className="hidden sm:grid sm:grid-cols-12 bg-gray-50 p-4 text-sm font-medium text-gray-600">
            <div className="sm:col-span-6">Product</div>
            <div className="sm:col-span-2">Price</div>
            <div className="sm:col-span-4">Actions</div>
          </div>

          {/* Wishlist items */}
          <div className="divide-y divide-gray-100">
            {wishlistItems.map((item) => (
              <div key={item.product_id} className="p-4 sm:grid sm:grid-cols-12 sm:gap-4 sm:items-center flex flex-col gap-4">
                {/* Product info - Mobile: Stacked, Desktop: Row */}
                <div className="flex items-center gap-4 sm:col-span-6">
                  <Link href={`/products/${item.product_id}`} className="shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 overflow-hidden rounded-lg bg-gray-50 border border-gray-100 hover:border-[#024E82] transition-colors">
                      <img
                        src={item.product_image.split(",")[0]}
                        alt={item.product_name}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.product_id}`}>
                      <h3 className="text-sm sm:text-base font-medium text-gray-800 line-clamp-2 hover:text-[#024E82] transition-colors">
                        {item.product_name}
                      </h3>
                    </Link>
                    {/* Mobile only price */}
                    <p className="text-[#024E82] font-bold mt-1 sm:hidden">₹{item.total_price}</p>
                  </div>
                </div>

                {/* Price - Hidden on mobile */}
                <div className="hidden sm:block sm:col-span-2 font-medium text-[#024E82]">
                  ₹{item.total_price}
                </div>

                {/* Actions */}
                <div className="sm:col-span-4 flex flex-wrap gap-2 w-full sm:justify-start">
                  <button
                    onClick={() => handleAddToCart(item.product_id, item.product_name)}
                    className="flex items-center gap-2 flex-1 sm:flex-none bg-[#024E82] text-white px-4 py-2.5 rounded-md hover:bg-[#023e68] transition-colors text-sm font-medium"
                  >
                    <FiShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                  <button
                    onClick={() => handleRemoveItem(item.product_id, item.product_name)}
                    className="flex items-center gap-2 flex-1 sm:flex-none bg-gray-100 text-gray-700 px-4 py-2.5 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    <FiTrash2 className="w-4 h-4 text-red-500" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-lg bg-gray-50 border border-gray-100">
          <div className="flex justify-center mb-4">
            <FiHeart className="w-16 h-16 text-gray-300" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Items added to your wishlist will appear here. Start shopping to add your favorite products!
          </p>
          <Link 
            href="/products" 
            className="inline-flex items-center bg-[#024E82] text-white px-6 py-3 rounded-md hover:bg-[#023e68] transition-colors font-medium"
          >
            <FiShoppingBag className="mr-2" />
            Browse Products
          </Link>
        </div>
      )}
    </div>

    {showPopup && (
      <Popup 
        message={popupMessage} 
        onClose={closePopup} 
        type={popupType} 
      />
    )}
    </>
  );
};

export default Wishlist;
