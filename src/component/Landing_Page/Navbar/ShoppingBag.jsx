"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MdOutlineClose, MdOutlineShoppingBag, MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { FiPlus, FiMinus, FiShoppingCart, FiTag, FiArrowRight } from "react-icons/fi";
import axios from "axios";
import Popup from "@/component/Landing_Page/CheckoutPage/Popup";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const ShoppingCart = () => {
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("info");
  const [showPopup, setShowPopup] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [authToken, setAuthToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const closePopup = () => {
    setShowPopup(false);
  };

  useEffect(() => {
    // Get authToken from localStorage
    const token = localStorage.getItem("authToken");
    if (token) {
      setAuthToken(token);
    } else {
      setPopupMessage("Please log in to view and manage your cart.");
      setPopupType("info");
      setShowPopup(true);
      setLoading(false);
    }
  }, []);

  // Fetch cart items once the token is set
  useEffect(() => {
    if (authToken) {
      fetchCartItems();
    }
  }, [authToken]);

  const fetchCartItems = () => {
    setLoading(true);
    axios
      .get(`${apiBaseUrl}/cart`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      .then(async (response) => {
        const cartItems = await Promise.all(
          response.data.cartItems.map(async (item) => {
            const stockInfo = await fetchStockInfo(
              item.product_id,
              item.color,
              item.size
            );
            return {
              ...item,
              product_image: item.product_image,
              stock: stockInfo.stock,
              threshold: stockInfo.threshold,
            };
          })
        );
        setCartItems(cartItems || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching cart items:", error);
        setLoading(false);
      });
  };

  // Fetch stock info for a specific product, color, and size
  const fetchStockInfo = async (productID, color, size) => {
    try {
      const response = await axios.get(
        `${apiBaseUrl}/stock_no?product_id=${productID}&color=${color}&size=${size}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching stock info:", error);
      return { stock: 0, threshold: 0 };
    }
  };

  // Remove item from cart
  const handleRemoveItem = (productID, size, color) => {
    if (!authToken) {
      setPopupMessage("You are not logged in. Please login first.");
      setPopupType("error");
      setShowPopup(true);
      return;
    }

    axios
      .delete(`${apiBaseUrl}/cart/${productID}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        data: { size, color },
      })
      .then(() => {
        setCartItems((prevItems) =>
          prevItems.filter(
            (item) =>
              !(item.product_id === productID && item.size === size && item.color === color)
          )
        );
        setPopupMessage("Item removed from cart successfully.");
        setPopupType("success");
        setShowPopup(true);
      })
      .catch((error) => {
        console.error("Error removing item:", error);
        setPopupMessage("Failed to remove item from cart. Please try again.");
        setPopupType("error");
        setShowPopup(true);
      });
  };

  // Update item quantity
  const handleQuantityChange = (id, size, color, quantity, currentQty) => {
    if (quantity < 1 || !authToken) return;
    
    // Optimistic update for a smoother UI experience
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product_id === id && item.size === size && item.color === color
          ? { ...item, quantity }
          : item
      )
    );

    axios
      .put(
        `${apiBaseUrl}/cart_qty/${id}`,
        { size, color, quantity },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then(() => {
        // Success, already updated optimistically
      })
      .catch((error) => {
        console.error("Error updating quantity:", error);
        setPopupMessage("Failed to update quantity. Please try again.");
        setPopupType("error");
        setShowPopup(true);
        
        // Revert back on failure
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item.product_id === id && item.size === size && item.color === color
              ? { ...item, quantity: currentQty }
              : item
          )
        );
      });
  };

  const handleApplyCoupon = () => {
    if (!couponCode) return;
    
    // Simulate coupon application
    // In a real app, you would call an API endpoint to validate and apply the coupon
    if (couponCode === "DISCOUNT20") {
      setAppliedCoupon({
        code: couponCode,
        discount: 0.2,
        discountType: "percentage"
      });
      setPopupMessage("Coupon applied successfully!");
      setPopupType("success");
      setShowPopup(true);
    } else {
      setPopupMessage("Invalid coupon code. Please try again.");
      setPopupType("error");
      setShowPopup(true);
    }
    
    setCouponCode("");
  };

  // Calculate subtotal
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.total_price * item.quantity,
    0
  );
  
  // Calculate discount if coupon is applied
  const discount = appliedCoupon 
    ? appliedCoupon.discountType === "percentage" 
      ? subtotal * appliedCoupon.discount 
      : appliedCoupon.discount
    : 0;
  
  // Calculate total price
  const total = subtotal - discount;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#024E82]"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-12"
        >
          <div className="text-gray-400 mb-6">
            <MdOutlineShoppingBag className="w-24 h-24" />
          </div>
          <div className="text-center space-y-4 max-w-md">
            <h2 className="text-2xl font-bold text-gray-800">Your cart is empty</h2>
            <p className="text-gray-600">
              Looks like you haven't added anything to your cart yet.
              Browse our collection and discover something you'll love!
            </p>
            <Link href="/products" passHref>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-6 bg-[#024E82] text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center justify-center mx-auto"
              >
                <FiShoppingCart className="mr-2" />
                Continue Shopping
              </motion.button>
            </Link>
          </div>
        </motion.div>
        {showPopup && (
          <Popup message={popupMessage} onClose={closePopup} type={popupType} />
        )}
      </>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 mb-8">
          <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm sm:text-base transition-colors">
            Home
          </Link>
          <span className="text-gray-400">/</span>
          <span className="font-medium text-gray-800 text-sm sm:text-base">Shopping Cart</span>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col lg:flex-row lg:space-x-8"
        >
          {/* Cart Items Section */}
          <motion.div variants={itemVariants} className="w-full lg:w-2/3">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Shopping Cart ({cartItems.length} items)</h2>
              </div>
              
              <div className="hidden sm:grid sm:grid-cols-12 text-left items-center font-medium text-gray-500 px-6 py-3 bg-gray-50">
                <p className="col-span-6">Product</p>
                <p className="col-span-2 text-center">Price</p>
                <p className="col-span-2 text-center">Quantity</p>
                <p className="col-span-2 text-center">Total</p>
              </div>

              <div className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <motion.div 
                    key={`${item.product_id}-${item.size}-${item.color}`}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-6 py-4 sm:grid sm:grid-cols-12 gap-4 text-left items-center"
                  >
                    {/* Product Info */}
                    <div className="col-span-6 flex items-center space-x-4 mb-3 sm:mb-0">
                      <button
                        onClick={() => handleRemoveItem(item.product_id, item.size, item.color)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Remove item"
                      >
                        <MdOutlineClose className="w-5 h-5" />
                      </button>
                      <Link href={`/products/${item.product_id}`} className="flex-shrink-0">
                        <img
                          src={item.product_image.split(",")[0]}
                          alt={item.product_name}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md border border-gray-200"
                        />
                      </Link>
                      <div>
                        <h3 className="font-medium text-gray-800 line-clamp-2">{item.product_name}</h3>
                        <div className="mt-1 text-sm text-gray-500">
                          <span className="inline-block mr-3">Size: {item.size}</span>
                          <span className="inline-block">Color: {item.color}</span>
                        </div>
                        {item.stock <= item.threshold && (
                          <p className="text-sm text-orange-600 mt-1">Only {item.stock} left!</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Price - Mobile & Desktop */}
                    <div className="col-span-2 flex justify-between sm:block sm:text-center mb-3 sm:mb-0">
                      <span className="sm:hidden font-medium">Price:</span>
                      <span className="font-medium sm:font-semibold text-gray-800">₹{item.total_price}</span>
                    </div>
                    
                    {/* Quantity - Mobile & Desktop */}
                    <div className="col-span-2 flex justify-between sm:justify-center items-center mb-3 sm:mb-0">
                      <span className="sm:hidden font-medium">Quantity:</span>
                      <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                        <button
                          onClick={() => handleQuantityChange(item.product_id, item.size, item.color, Math.max(1, item.quantity - 1), item.quantity)}
                          disabled={item.quantity <= 1}
                          className={`px-2 py-1 ${item.quantity <= 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          <FiMinus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-1 font-medium text-center min-w-[40px]">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.product_id, item.size, item.color, Math.min(item.stock, item.quantity + 1), item.quantity)}
                          disabled={item.quantity >= item.stock}
                          className={`px-2 py-1 ${item.quantity >= item.stock ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          <FiPlus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Total - Mobile & Desktop */}
                    <div className="col-span-2 flex justify-between sm:block sm:text-center">
                      <span className="sm:hidden font-medium">Total:</span>
                      <span className="font-bold text-[#024E82]">₹{(item.total_price * item.quantity).toFixed(2)}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Continue Shopping Button */}
            <div className="mb-8 sm:mb-0">
              <Link href="/products" className="inline-flex items-center text-[#024E82] hover:text-blue-700 font-medium transition-colors">
                <MdOutlineKeyboardArrowLeft className="mr-1" />
                Continue Shopping
              </Link>
            </div>
          </motion.div>

          {/* Order Summary Section */}
          <motion.div variants={itemVariants} className="w-full lg:w-1/3">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Order Summary</h2>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Coupon Code */}
                <div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter coupon code"
                      className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#024E82] focus:border-transparent"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center"
                    >
                      <FiTag className="mr-1" />
                      Apply
                    </button>
                  </div>
                  {appliedCoupon && (
                    <div className="mt-2 text-sm text-green-600 flex items-center">
                      <span className="inline-block mr-2">✓</span>
                      Coupon "{appliedCoupon.code}" applied: {appliedCoupon.discount * 100}% off
                    </div>
                  )}
                </div>
                
                {/* Calculation */}
                <div className="space-y-2 pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping:</span>
                    <span>Free</span>
                  </div>
                  
                  <div className="flex justify-between font-bold text-gray-800 text-lg pt-4 border-t border-gray-100">
                    <span>Total:</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
                
                {/* Checkout Button */}
                <Link href="/checkoutpage" className="block mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-[#024E82] text-white rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    Proceed to Checkout
                    <FiArrowRight className="ml-2" />
                  </motion.button>
                </Link>
                
                <p className="text-xs text-gray-500 text-center mt-4">
                  Secure checkout powered by trusted payment gateways
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      {showPopup && (
        <Popup message={popupMessage} onClose={closePopup} type={popupType} />
      )}
    </>
  );
};

export default ShoppingCart;
