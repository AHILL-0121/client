"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation"; // Import useRouter from Next.js
import Popup from "@/component/Landing_Page/CheckoutPage/Popup";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function BecomeAMerchant() {
  const [formData, setFormData] = useState({
    merchantName: "",
    merchantEmail: "",
    merchantPassword: "",
    merchantPhone: "",
    merchantAddress: "",
    gstin: "",
    otp: "",
  });

  // Add validation state
  const [validation, setValidation] = useState({
    merchantName: { isValid: true, message: "" },
    merchantEmail: { isValid: true, message: "" },
    merchantPassword: { isValid: true, message: "" },
    merchantPhone: { isValid: true, message: "" },
    merchantAddress: { isValid: true, message: "" },
    gstin: { isValid: true, message: "" },
  });
  
  // Add password strength visualization
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0, // 0-4 scale (0 = none, 4 = strong)
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [formError, setFormError] = useState("");
  const [resendTimer, setResendTimer] = useState(0); // Timer for resend OTP
  const [formValid, setFormValid] = useState(false); // Overall form validity
  const router = useRouter(); // Initialize the router
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");

  // Effect to handle countdown for resend timer
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  // Validate form on data change
  useEffect(() => {
    validateForm();
  }, [formData]);

  // Form validation logic
  const validateForm = () => {
    const newValidation = {
      merchantName: { isValid: true, message: "" },
      merchantEmail: { isValid: true, message: "" },
      merchantPassword: { isValid: true, message: "" },
      merchantPhone: { isValid: true, message: "" },
      merchantAddress: { isValid: true, message: "" },
      gstin: { isValid: true, message: "" },
    };
    
    let isFormValid = true;

    // Name validation
    if (formData.merchantName.trim().length === 0) {
      newValidation.merchantName = { isValid: false, message: "Name is required" };
      isFormValid = false;
    } else if (formData.merchantName.trim().length < 3) {
      newValidation.merchantName = { isValid: false, message: "Name must be at least 3 characters" };
      isFormValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.merchantEmail.trim().length === 0) {
      newValidation.merchantEmail = { isValid: false, message: "Email is required" };
      isFormValid = false;
    } else if (!emailRegex.test(formData.merchantEmail)) {
      newValidation.merchantEmail = { isValid: false, message: "Please enter a valid email address" };
      isFormValid = false;
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (formData.merchantPhone.trim().length === 0) {
      newValidation.merchantPhone = { isValid: false, message: "Phone number is required" };
      isFormValid = false;
    } else if (!phoneRegex.test(formData.merchantPhone)) {
      newValidation.merchantPhone = { isValid: false, message: "Please enter a valid 10-digit phone number" };
      isFormValid = false;
    }

    // Address validation
    if (formData.merchantAddress.trim().length === 0) {
      newValidation.merchantAddress = { isValid: false, message: "Address is required" };
      isFormValid = false;
    } else if (formData.merchantAddress.trim().length < 5) {
      newValidation.merchantAddress = { isValid: false, message: "Please enter a complete address" };
      isFormValid = false;
    }

    // GSTIN validation - making it mandatory
    if (formData.gstin.trim().length === 0) {
      newValidation.gstin = { isValid: false, message: "GSTIN is required" };
      isFormValid = false;
    }

    // Password validation
    const hasMinLength = formData.merchantPassword.length >= 8;
    const hasUpperCase = /[A-Z]/.test(formData.merchantPassword);
    const hasLowerCase = /[a-z]/.test(formData.merchantPassword);
    const hasNumber = /[0-9]/.test(formData.merchantPassword);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.merchantPassword);
    
    // Update password strength
    setPasswordStrength({
      hasMinLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
      score: [hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length,
    });

    if (formData.merchantPassword.trim().length === 0) {
      newValidation.merchantPassword = { isValid: false, message: "Password is required" };
      isFormValid = false;
    } else if (!hasMinLength) {
      newValidation.merchantPassword = { isValid: false, message: "Password must be at least 8 characters long" };
      isFormValid = false;
    } else if (!(hasUpperCase && hasLowerCase && hasNumber)) {
      newValidation.merchantPassword = { 
        isValid: false, 
        message: "Password must contain at least one uppercase letter, one lowercase letter, and one number" 
      };
      isFormValid = false;
    }

    setValidation(newValidation);
    setFormValid(isFormValid);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (resendTimer > 0) {
      setOtpError(`Please wait ${resendTimer} seconds before resending OTP.`);
      return;
    }

    validateForm();
    if (!formValid) {
      setFormError("Please fix the errors in the form before proceeding.");
      return;
    }

    try {
      const response = await axios.post(`${apiBaseUrl}/m-send-otp`, {
        email: formData.merchantEmail,
      });

      if (response.status === 200) {
        setOtpSent(true);
        setOtpError("");
        setFormError("");
        setResendTimer(60);
        setPopupMessage("OTP sent to your email!");
        setPopupType("success");
        setShowPopup(true);
      }
    } catch (error) {
      if (error.response && error.response.data.error) {
        setOtpError(error.response.data.error);
      } else {
        setOtpError("Failed to send OTP. Please try again.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpSent) {
      setOtpError("Please send and verify the OTP before submitting.");
      return;
    }

    if (formData.otp.trim() === "") {
      setOtpError("Please enter the OTP received in your email.");
      return;
    }

    try {
      const response = await axios.post(`${apiBaseUrl}/merchantregister`, formData);
      if (response.status === 200) {
        setPopupMessage("Merchant account created successfully!");
        setPopupType("success");
        setShowPopup(true);
        setTimeout(() => {
          router.push("/merchant/login");
        }, 1500);
      }
    } catch (error) {
      if (error.response && error.response.data.error) {
        setPopupMessage(error.response.data.error);
      } else {
        setPopupMessage("An error occurred during registration. Please try again.");
      }
      setPopupType("error");
      setShowPopup(true);
    }
  };

  // Get input class based on validation state
  const getInputClass = (fieldName) => {
    const baseClass = "w-full border rounded-md p-2 focus:outline-none";
    if (validation[fieldName].isValid) {
      return `${baseClass} focus:ring focus:ring-blue-200 border-gray-300`;
    }
    return `${baseClass} focus:ring focus:ring-red-200 border-red-300`;
  };

  // Password strength indicator
  const renderPasswordStrength = () => {
    const strengthText = ["", "Very Weak", "Weak", "Medium", "Strong", "Very Strong"];
    const strengthClass = [
      "bg-gray-200",
      "bg-red-500",
      "bg-orange-500",
      "bg-yellow-500",
      "bg-green-400",
      "bg-green-600"
    ];
    
    return (
      <div className="mt-2">
        <div className="flex justify-between items-center mb-1">
          <div className="text-xs">{strengthText[passwordStrength.score]}</div>
        </div>
        <div className="w-full h-1 bg-gray-200 rounded-full">
          <div 
            className={`h-1 rounded-full transition-all duration-300 ${strengthClass[passwordStrength.score]}`} 
            style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
          ></div>
        </div>
        <div className="grid grid-cols-2 gap-1 mt-2">
          <div className={`text-xs ${passwordStrength.hasMinLength ? 'text-green-600' : 'text-gray-500'}`}>
            ✓ 8+ characters
          </div>
          <div className={`text-xs ${passwordStrength.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
            ✓ Uppercase letter
          </div>
          <div className={`text-xs ${passwordStrength.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
            ✓ Lowercase letter
          </div>
          <div className={`text-xs ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
            ✓ Number
          </div>
          <div className={`text-xs ${passwordStrength.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
            ✓ Special character
          </div>
        </div>
      </div>
    );
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="flex flex-col items-center bg-gray-50 min-h-screen">
      <header className="w-full flex justify-center py-6">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-semibold">Become a Merchant</h1>
        </div>
      </header>

      <main className="flex flex-col md:flex-row md:justify-center items-center w-full max-w-4xl px-4 py-10 bg-white shadow-md rounded-md">
        {/* Form Section */}
        <div className="w-full md:w-1/2">
          <h2 className="text-xl font-bold mb-4">Welcome to Outfit Fashions</h2>
          <p className="text-gray-600 mb-6">Create your account to start selling</p>
          <form className="space-y-4" onSubmit={otpSent ? handleSubmit : handleSendOtp}>
            <div>
              <label className="block text-gray-700 text-sm mb-1">Full Name</label>
              <input
                type="text"
                name="merchantName"
                value={formData.merchantName}
                onChange={handleInputChange}
                placeholder="Enter your name"
                className={getInputClass("merchantName")}
                required
              />
              {!validation.merchantName.isValid && (
                <p className="text-red-500 text-xs mt-1">{validation.merchantName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-1">Email ID</label>
              <input
                type="email"
                name="merchantEmail"
                value={formData.merchantEmail}
                onChange={handleInputChange}
                placeholder="Email Id"
                className={getInputClass("merchantEmail")}
                required
              />
              {!validation.merchantEmail.isValid && (
                <p className="text-red-500 text-xs mt-1">{validation.merchantEmail.message}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-1">Phone Number</label>
              <input
                type="text"
                name="merchantPhone"
                value={formData.merchantPhone}
                onChange={handleInputChange}
                placeholder="Enter Mobile Number"
                className={getInputClass("merchantPhone")}
                required
              />
              {!validation.merchantPhone.isValid && (
                <p className="text-red-500 text-xs mt-1">{validation.merchantPhone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-1">Address</label>
              <input
                type="text"
                name="merchantAddress"
                value={formData.merchantAddress}
                onChange={handleInputChange}
                placeholder="Enter Address"
                className={getInputClass("merchantAddress")}
                required
              />
              {!validation.merchantAddress.isValid && (
                <p className="text-red-500 text-xs mt-1">{validation.merchantAddress.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm mb-1">GSTIN <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="gstin"
                value={formData.gstin}
                onChange={handleInputChange}
                placeholder="GSTIN"
                className={getInputClass("gstin")}
              />

              {!validation.gstin.isValid && (
                <p className="text-red-500 text-xs mt-1">{validation.gstin.message}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">Please enter a valid GSTIN number</p>
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-1">Set Password</label>
              <input
                type="password"
                name="merchantPassword"
                value={formData.merchantPassword}
                onChange={handleInputChange}
                placeholder="Set Password"
                className={getInputClass("merchantPassword")}
                required
              />
              {!validation.merchantPassword.isValid && (
                <p className="text-red-500 text-xs mt-1">{validation.merchantPassword.message}</p>
              )}
              {formData.merchantPassword && renderPasswordStrength()}
            </div>

            {otpSent && (
              <div>
                <label className="block text-gray-700 text-sm mb-1">Enter OTP</label>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleInputChange}
                  placeholder="Enter OTP"
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200"
                  required
                />
                {/* Resend OTP Section */}
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-gray-600">
                    {resendTimer > 0
                      ? `Resend OTP in ${resendTimer} seconds`
                      : "Didn't receive the OTP?"}
                  </p>
                  {resendTimer === 0 && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-sm text-blue-500 hover:underline focus:outline-none"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>
            )}

            <button 
              type="submit"
              className={`w-full py-2 rounded-md text-white transition-colors ${
                !otpSent && !formValid 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-gray-600 hover:bg-gray-700"
              }`}
              disabled={!otpSent && !formValid}
            >
              {otpSent ? "Create Account" : "Send OTP"}
            </button>

            {otpError && (
              <div className="bg-red-50 border border-red-100 text-red-500 p-2 rounded-md text-sm">
                {otpError}
              </div>
            )}
            {formError && (
              <div className="bg-red-50 border border-red-100 text-red-500 p-2 rounded-md text-sm">
                {formError}
              </div>
            )}
          </form>

          <div className="text-center mt-4">
            <p className="text-gray-600 text-sm">or</p>
            <a href="/merchant/login" className="text-blue-500 text-sm hover:underline">
              Already a user? Login
            </a>
          </div>
        </div>

        {/* Illustration Section */}
        <div className="w-full md:w-1/2 mt-6 md:mt-0 flex flex-col items-center space-y-4">
          <img
            src="/merchant/mer_reg1.jpg"
            alt="Placeholder 1"
            className="w-2/3 md:w-3/4 object-contain"
          />
          <img
            src="/merchant/mer_reg2.jpg"
            alt="Placeholder 2"
            className="w-2/3 md:w-3/4 object-contain"
          />
        </div>
      </main>
      {showPopup && (
        <Popup 
          message={popupMessage} 
          onClose={closePopup} 
          type={popupType}
        />
      )}
    </div>
  );
}
