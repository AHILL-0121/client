import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiEdit, FiTrash, FiCheck, FiX, FiMapPin, FiPhone, FiUser, FiHome, FiFlag, FiMap } from "react-icons/fi";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function AddressSection({ onAddressSelect }) {
  const [showForm, setShowForm] = useState(false);
  const [shippingInfo, setShippingInfo] = useState([]);
  const [editAddress, setEditAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [currentForm, setCurrentForm] = useState({
    receiver_name: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    pincode: "",
    landmark: "",
  });
  const [selectedAddress, setSelectedAddress] = useState(null);

  let authToken;
  if (typeof window !== 'undefined') {
    authToken = localStorage.getItem('authToken');
  }
  
  
  const clearForm = () => {
    setCurrentForm({
      receiver_name: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      pincode: "",
      landmark: "",
    });
    setEditAddress(null);
  };

  const fetchUserAddress = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${apiBaseUrl}/useraddress`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setShippingInfo(response.data.shipping_info || []);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching user addresses:", error);
      setMessage({ text: "Failed to load addresses", type: "error" });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAddress();
  }, []);
  
  // Clear message after 3 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleForm = () => {
    setShowForm(!showForm);
    if (!showForm) clearForm();
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editAddress) {
        const { id, ...updateData } = currentForm;
        await axios.put(
          `${apiBaseUrl}/userupdate`,
          { ...updateData },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        setMessage({ text: "Address updated successfully!", type: "success" });
      } else {
        await axios.post(
          `${apiBaseUrl}/user`,
          currentForm,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        setMessage({ text: "New address added successfully!", type: "success" });
      }
      setShowForm(false);
      fetchUserAddress();
    } catch (error) {
      console.error("Error saving address:", error);
      setMessage({ text: "Failed to save address", type: "error" });
      setIsLoading(false);
    }
  };

  const handleEdit = (address) => {
    setEditAddress(address);
    const { id, ...editableData } = address;
    setCurrentForm(editableData);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    setIsDeleting(true);
    try {
      await axios.delete(`${apiBaseUrl}/userdelete`, {
        data: { address_id: id },
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setMessage({ text: "Address deleted successfully!", type: "success" });
      fetchUserAddress();
    } catch (error) {
      console.error("Error deleting address:", error);
      setMessage({ text: "Failed to delete address", type: "error" });
      setIsDeleting(false);
    }
  };

  const handleUseAddress = (address) => {
    setSelectedAddress(address);
    onAddressSelect(address); // Notify parent component
  };

  // Icon mapping for form fields
  const getFieldIcon = (field) => {
    const icons = {
      receiver_name: <FiUser className="text-gray-400" />,
      phone: <FiPhone className="text-gray-400" />,
      address: <FiHome className="text-gray-400" />,
      city: <FiMapPin className="text-gray-400" />,
      country: <FiFlag className="text-gray-400" />,
      pincode: <FiMap className="text-gray-400" />,
      landmark: <FiMapPin className="text-gray-400" />,
    };
    return icons[field] || null;
  };

  return (
    <div className="w-full">
      {/* Notification message */}
      <AnimatePresence>
        {message.text && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-4 p-3 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} flex items-center justify-between`}
          >
            <p>{message.text}</p>
            <button 
              onClick={() => setMessage({ text: "", type: "" })}
              className="text-gray-600 hover:text-gray-800"
            >
              <FiX />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <Link
          href="/Shoppingbag"
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Return to Cart
        </Link>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={toggleForm}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
        >
          <FiPlus size={16} />
          Add New Address
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form
              onSubmit={handleFormSubmit}
              className="p-6 bg-white border border-gray-200 rounded-lg shadow-md space-y-4 mb-6"
            >
              <h3 className="font-semibold text-lg border-b border-gray-200 pb-2">
                {editAddress ? "Edit Address" : "New Address"}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(currentForm).map((key) => (
                  <div key={key} className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                      {key.replace("_", " ")}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {getFieldIcon(key)}
                      </div>
                      <input
                        type="text"
                        name={key}
                        value={currentForm[key]}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder={`Enter ${key.replace("_", " ")}`}
                        required={key !== "landmark"}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end space-x-3 pt-3">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button" 
                  onClick={toggleForm} 
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md shadow-sm hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Cancel
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <FiCheck className="mr-2" />
                  )}
                  {editAddress ? "Update Address" : "Save Address"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading && !showForm ? (
        <div className="flex justify-center p-10">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {shippingInfo.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {shippingInfo.map((address, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex flex-col justify-between border p-4 rounded-lg ${
                    selectedAddress?.address_id === address.address_id 
                      ? 'border-blue-600 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                  } transition-all duration-200`}
                >
                  <div className="mb-3">
                    <h4 className="font-semibold text-lg">{address.receiver_name}</h4>
                    <p className="text-gray-700">{address.phone}</p>
                    <p className="text-gray-600 mt-1">{`${address.address}, ${address.city}, ${address.country} - ${address.pincode}`}</p>
                    {address.landmark && (
                      <p className="text-gray-500 mt-1 text-sm">
                        <span className="font-medium">Landmark:</span> {address.landmark}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEdit(address)} 
                      className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <FiEdit className="mr-1" size={14} />
                      Edit
                    </motion.button>
                    
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(address.address_id)}
                      disabled={isDeleting}
                      className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded text-red-600 hover:bg-red-50 transition-colors"
                    >
                      {isDeleting ? (
                        <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin mr-1"></div>
                      ) : (
                        <FiTrash className="mr-1" size={14} />
                      )}
                      Delete
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleUseAddress(address)}
                      className={`flex items-center px-3 py-1 text-sm rounded ml-auto ${
                        selectedAddress?.address_id === address.address_id
                          ? 'bg-blue-600 text-white'
                          : 'border border-blue-600 text-blue-600 hover:bg-blue-50'
                      } transition-colors`}
                    >
                      {selectedAddress?.address_id === address.address_id ? (
                        <>
                          <FiCheck className="mr-1" size={14} />
                          Selected
                        </>
                      ) : (
                        'Use Address'
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200"
            >
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <p className="text-lg text-gray-600 mb-4">No addresses found</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={toggleForm}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FiPlus className="mr-2" />
                Add Your First Address
              </motion.button>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
