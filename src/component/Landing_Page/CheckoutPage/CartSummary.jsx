"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Popup from "./Popup"; // Import the Popup component

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function CartSummary({ selectedAddress }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartData, setCartData] = useState(null);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [userDetails, setUserDetails] = useState(null);
  const [popupMessage, setPopupMessage] = useState(""); // State to control popup message
  const [showPopup, setShowPopup] = useState(false); // State to control popup visibility
  const router = useRouter();

  const authToken =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const fetchCartItems = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/cart`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const { cartItems } = response.data;

      const availableCartItems = cartItems.filter(
        (item) => item.is_available !== "out_of_stock"
      );

      if (availableCartItems.length === 0) {
        return;
      }

      setCartItems(availableCartItems);
      setCartData(response.data);

      const calculatedSubtotal = availableCartItems.reduce(
        (acc, item) => acc + item.total_price * item.quantity,
        0
      );
      setSubtotal(calculatedSubtotal);

      const calculatedShipping = calculatedSubtotal < 1000 ? 40 : 0;
      setShipping(calculatedShipping);

      setCartTotal(calculatedSubtotal + calculatedShipping);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      setPopupMessage("Failed to fetch cart items. Please try again later.");
      setShowPopup(true);
    }
  };

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/checkouthelper`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setUserDetails(response.data);
    } catch (error) {
      console.error("Error fetching user details:", error);
      setPopupMessage("Failed to fetch user details. Please try again later.");
      setShowPopup(true);
    }
  };

  const initiatePayment = async () => {
    if (cartItems.length === 0) {
      setPopupMessage("Your cart is empty. Please add items to your cart before proceeding.");
      setShowPopup(true);
      return;
    }

    if (!selectedAddress) {
      setPopupMessage("Please select a shipping address before proceeding.");
      setShowPopup(true);
      return;
    }

    try {
      const response = await axios.post(
        `${apiBaseUrl}/place-order`,
        {
          total_price: cartTotal * 100,
          address: selectedAddress,
          cart_items: cartItems,
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      const { "order-id": order_id } = response.data;

      const options = {
        key: "rzp_test_5jNBVbqmrqPO9U",
        amount: cartTotal * 100,
        currency: "INR",
        name: "Your Shop Name",
        description: "Test Transaction",
        order_id,
        handler: async function (response) {
          const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;

          if (!razorpay_payment_id) {
            setPopupMessage("Payment failed!");
            setShowPopup(true);
            return;
          }

          try {
            const verifyResponse = await axios.post(
              `${apiBaseUrl}/verify-order`,
              {
                razorpay_payment_id,
                razorpay_order_id,
                razorpay_signature,
                address: selectedAddress,
                cart_items: cartItems,
              },
              {
                headers: { Authorization: `Bearer ${authToken}` },
              }
            );

            if (verifyResponse.data.success) {
              router.push("/paysuccess");
            } else {
              setPopupMessage("Payment verification failed!");
              setShowPopup(true);
            }
          } catch (error) {
            console.error("Error verifying payment:", error);
            setPopupMessage("Error verifying payment. Please try again.");
            setShowPopup(true);
          }
        },
        prefill: {
          name: userDetails?.username || "Customer Name",
          email: userDetails?.email || "customer@example.com",
          contact: userDetails?.number || "9999999999",
        },
        theme: {
          color: "#686CFD",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setPopupMessage("Some items in your cart are out of stock. Please update your cart.");
        setShowPopup(true);
      } else {
        console.error("Error initiating payment:", error);
        setPopupMessage("Failed to initiate payment. Please try again.");
        setShowPopup(true);
      }
    }
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (authToken) {
      fetchCartItems();
      fetchUserDetails();
    }
  }, [authToken]);

  return (
    <>
      <h2 className="text-lg font-semibold mb-6">YOUR CART</h2>
      {cartItems.length > 0 ? (
        cartItems.map((item, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-4 items-center mb-6">
            <div className="col-span-3 h-16 relative">
              <Link href={`/products/${item.product_id}`}>
                <Image
                  src={item.product_image.split(",")[0]}
                  alt={item.product_name}
                  fill
                  objectFit="cover"
                  className="rounded-md"
                />
              </Link>
            </div>
            <div className="col-span-6">
              <p className="font-semibold">{item.product_name}</p>
              <p className="text-sm text-gray-600">
                {item.size} - {item.color}
              </p>
            </div>
            <div className="col-span-3 flex justify-end">
              <p className="font-semibold">
                ₹{(item.total_price * item.quantity).toFixed(2)}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p>No items in your cart.</p>
      )}
      <div className="border-b border-gray-300 my-4"></div>
      <div className="flex justify-between text-gray-600">
        <p>Item Subtotal</p>
        <p>₹ {subtotal.toFixed(2)}</p>
      </div>
      <div className="flex justify-between text-gray-600">
        <p>Shipping</p>
        <p>₹ {shipping.toFixed(2)}</p>
      </div>
      <div className="border-b border-gray-300 my-4"></div>
      <div className="flex justify-between text-lg font-semibold">
        <p>Total</p>
        <p>₹ {cartTotal.toFixed(2)}</p>
      </div>
      <div className="flex space-x-4 mt-8">
        <button
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold px-10 py-2 rounded-md"
          onClick={initiatePayment}
        >
          Pay ₹ {cartTotal.toFixed(2)}
        </button>
      </div>

      {/* Show Popup for all messages */}
      {showPopup && (
        <Popup message={popupMessage} onClose={closePopup} />
      )}
    </>
  );
}

