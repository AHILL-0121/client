"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation"; // For client-side redirection

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ClientSignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    number: "",
  });
  
  // Add validation state
  const [validation, setValidation] = useState({
    username: { isValid: true, message: "" },
    email: { isValid: true, message: "" },
    password: { isValid: true, message: "" },
    number: { isValid: true, message: "" },
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
  
  const [otp, setOtp] = useState(""); // For OTP input
  const [isOtpSent, setIsOtpSent] = useState(false); // Track OTP step
  const [isVerified, setIsVerified] = useState(false); // Track verification
  const [error, setError] = useState(""); // To handle errors
  const [resendTimer, setResendTimer] = useState(30); // Timer for "Resend OTP"
  const [canResendOtp, setCanResendOtp] = useState(false); // Track when Resend OTP is enabled
  const [formValid, setFormValid] = useState(false); // Overall form validity
  const router = useRouter(); // Initialize useRouter for redirection

  useEffect(() => {
    let timer;
    if (isOtpSent && resendTimer > 0) {
      // Countdown logic
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      // Enable "Resend OTP" after timer ends
      setCanResendOtp(true);
    }
    return () => clearInterval(timer); // Cleanup the timer
  }, [isOtpSent, resendTimer]);

  // Validate form on data change
  useEffect(() => {
    validateForm();
  }, [formData]);

  // Form validation logic
  const validateForm = () => {
    const newValidation = {
      username: { isValid: true, message: "" },
      email: { isValid: true, message: "" },
      password: { isValid: true, message: "" },
      number: { isValid: true, message: "" },
    };
    
    let isFormValid = true;

    // Username validation
    if (formData.username.trim().length === 0) {
      newValidation.username = { isValid: false, message: "Username is required" };
      isFormValid = false;
    } else if (formData.username.trim().length < 3) {
      newValidation.username = { isValid: false, message: "Username must be at least 3 characters" };
      isFormValid = false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newValidation.username = { isValid: false, message: "Username can only contain letters, numbers and underscore" };
      isFormValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email.trim().length === 0) {
      newValidation.email = { isValid: false, message: "Email is required" };
      isFormValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newValidation.email = { isValid: false, message: "Please enter a valid email address" };
      isFormValid = false;
    }

    // Phone number validation
    const phoneRegex = /^[0-9]{10}$/;
    if (formData.number.trim().length === 0) {
      newValidation.number = { isValid: false, message: "Phone number is required" };
      isFormValid = false;
    } else if (!phoneRegex.test(formData.number)) {
      newValidation.number = { isValid: false, message: "Please enter a valid 10-digit phone number" };
      isFormValid = false;
    }

    // Password validation
    const hasMinLength = formData.password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumber = /[0-9]/.test(formData.password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password);
    
    // Update password strength
    setPasswordStrength({
      hasMinLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
      score: [hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length,
    });

    if (formData.password.trim().length === 0) {
      newValidation.password = { isValid: false, message: "Password is required" };
      isFormValid = false;
    } else if (!hasMinLength) {
      newValidation.password = { isValid: false, message: "Password must be at least 8 characters long" };
      isFormValid = false;
    } else if (!(hasUpperCase && hasLowerCase && hasNumber)) {
      newValidation.password = { 
        isValid: false, 
        message: "Password must contain at least one uppercase letter, one lowercase letter, and one number" 
      };
      isFormValid = false;
    }

    setValidation(newValidation);
    setFormValid(isFormValid);
  };

  // Handle input changes for both signup and OTP
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "otp") {
      setOtp(value); // OTP input
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    validateForm();
    
    if (!formValid) {
      setError("Please fix the errors in the form before proceeding.");
      return;
    }
    
    try {
      await axios.post(
        `${apiBaseUrl}/u-send-otp`,
        { email: formData.email },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setIsOtpSent(true); // Proceed to OTP verification step
      setError("");
      setResendTimer(30); // Reset timer for resend OTP
      setCanResendOtp(false); // Disable "Resend OTP"
    } catch (error) {
      if (error.response && error.response.data.error) {
        // If the backend responds with a specific error message
        setError(error.response.data.error);
      } else {
        setError("Failed to send OTP. Please try again.");
      }
      console.error("Error sending OTP:", error);
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    try {
      await axios.post(
        `${apiBaseUrl}/u-send-otp`,
        { email: formData.email },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setError("A new OTP has been sent to your email.");
      setResendTimer(30); // Restart the timer
      setCanResendOtp(false); // Disable "Resend OTP" until the timer ends
    } catch (error) {
      setError("Failed to resend OTP. Please try again.");
      console.error("Error resending OTP:", error);
    }
  };

  // Step 3: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${apiBaseUrl}/verify-otp`,
        { email: formData.email, code: otp },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.data.message === "OTP verified successfully") {
        setIsVerified(true); // Proceed to user creation
        handleSignup(); // Call the signup logic
      }
      setError("");
    } catch (error) {
      setError("Invalid or expired OTP. Please try again.");
      console.error("Error verifying OTP:", error);
    }
  };

  // Step 4: Create user account
  const handleSignup = async () => {
    try {
      const response = await axios.post(`${apiBaseUrl}/register`, formData, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("Signup successful:", response.data);

      // Save the token in localStorage (auto-login after signup)
      localStorage.setItem("authToken", response.data.token);

      // Redirect to home page after successful signup and login
      router.push("/");
    } catch (error) {
      setError("Email or Username already exists.");
      console.error("Error signing up:", error);
    }
  };

  // Get input class based on validation state
  const getInputClass = (fieldName) => {
    const baseClass = "w-full px-4 py-2 border rounded-lg focus:outline-none";
    if (validation[fieldName].isValid) {
      return `${baseClass} focus:ring-2 focus:ring-indigo-300 border-gray-300`;
    }
    return `${baseClass} focus:ring-2 focus:ring-red-300 border-red-300`;
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

  return (
    <div className="flex h-screen w-screen">
      {/* Left side: Welcome image */}
      <div className="w-1/2 bg-gray-100 flex items-center justify-center">
        <img
          src="/checkout/signup.svg"
          alt="Welcome illustration"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Right side: Signup form */}
      <div className="w-1/2 flex flex-col justify-center px-20 bg-white">
        {!isOtpSent ? (
          <>
            <h1 className="text-3xl font-bold mb-4">Create your account</h1>
            <p className="text-gray-600 mb-8">Enter your details to sign up</p>

            <form className="space-y-6" onSubmit={handleSendOtp}>
              {/* Username */}
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  className={getInputClass("username")}
                  value={formData.username}
                  onChange={handleChange}
                />
                {!validation.username.isValid && (
                  <p className="mt-1 text-sm text-red-600">{validation.username.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2">Email address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className={getInputClass("email")}
                  value={formData.email}
                  onChange={handleChange}
                />
                {!validation.email.isValid && (
                  <p className="mt-1 text-sm text-red-600">{validation.email.message}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium mb-2">Phone number</label>
                <input
                  type="text"
                  name="number"
                  placeholder="Enter your phone number"
                  className={getInputClass("number")}
                  value={formData.number}
                  onChange={handleChange}
                />
                {!validation.number.isValid && (
                  <p className="mt-1 text-sm text-red-600">{validation.number.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  className={getInputClass("password")}
                  value={formData.password}
                  onChange={handleChange}
                />
                {!validation.password.isValid && (
                  <p className="mt-1 text-sm text-red-600">{validation.password.message}</p>
                )}
                {formData.password && renderPasswordStrength()}
              </div>

              {/* Signup Button */}
              <button
                type="submit"
                className={`w-full py-2 text-white rounded-lg transition-colors ${
                  formValid 
                    ? "bg-indigo-600 hover:bg-indigo-700" 
                    : "bg-indigo-400 cursor-not-allowed"
                }`}
              >
                Send OTP
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-4">Verify OTP</h1>
            <p className="text-gray-600 mb-8">
              An OTP has been sent to your email. Enter it below to verify your account.
            </p>

            <form className="space-y-6" onSubmit={handleVerifyOtp}>
              <div>
                <label className="block text-sm font-medium mb-2">OTP</label>
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter the OTP"
                  className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300"
                  value={otp}
                  onChange={handleChange}
                />
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Verify OTP
              </button>

              {/* Resend OTP Button */}
              <button
                type="button"
                className={`w-full py-2 mt-4 ${
                  canResendOtp
                    ? "bg-gray-300 text-black hover:bg-gray-400"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                } rounded-lg`}
                onClick={canResendOtp ? handleResendOtp : undefined}
                disabled={!canResendOtp}
              >
                {canResendOtp ? "Resend OTP" : `Resend OTP in ${resendTimer}s`}
              </button>
            </form>
          </>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-md">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
