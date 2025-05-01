import React, { useState } from "react";
import axios from "axios";
import Popup from "@/component/Landing_Page/CheckoutPage/Popup";
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const ProductForm = ({ onClose, onSubmit }) => {
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  
  const closePopup = () => {
    setShowPopup(false);
  };

  // Define category options
  const categoryOptions = [
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

  // Define size options
  const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

  // Define color options with their hex values
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

  const [formData, setFormData] = useState({
    product_id: "",
    product_name: "",
    short_description: "",
    description: "",
    size: [],
    color: [],
    sku: "",
    category: "",
    tag: "",
    additional_info: "",
    merchant_price: "",
    margin: "",
    tax: "",
    gender: "unisex",
    brand: "",
    product_image: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSizeChange = (size) => {
    const updatedSizes = [...formData.size];
    
    if (updatedSizes.includes(size)) {
      // Remove size if already selected
      const index = updatedSizes.indexOf(size);
      updatedSizes.splice(index, 1);
    } else {
      // Add size if not already selected
      updatedSizes.push(size);
    }
    
    setFormData({ ...formData, size: updatedSizes });
  };

  const handleColorChange = (colorName) => {
    const updatedColors = [...formData.color];
    
    if (updatedColors.includes(colorName)) {
      // Remove color if already selected
      const index = updatedColors.indexOf(colorName);
      updatedColors.splice(index, 1);
    } else {
      // Add color if not already selected
      updatedColors.push(colorName);
    }
    
    setFormData({ ...formData, color: updatedColors });
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    setFormData({ ...formData, product_image: files });
    
    // Create URL previews for each file
    const fileArray = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setUploadedFiles(fileArray);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Convert array values to comma-separated strings for API
    const processedData = {
      ...formData,
      size: formData.size.join(','),
      color: formData.color.join(',')
    };

    const data = new FormData();
    Object.keys(processedData).forEach((key) => {
      if (key === "product_image") {
        for (let i = 0; i < processedData.product_image.length; i++) {
          data.append("product_image", processedData.product_image[i]);
        }
      } else {
        data.append(key, processedData[key]);
      }
    });

    try {
      const merctoken = localStorage.getItem("merctoken");
      const response = await axios.post(`${apiBaseUrl}/product`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${merctoken}`,
        },
      });
      console.log("Product created successfully:", response.data);
      setPopupMessage("Product created successfully!");
      setShowPopup(true);
      
      // Use the onSubmit callback if available
      if (typeof onSubmit === 'function') {
        onSubmit(processedData);
      } else {
        onClose(); // Fall back to onClose if onSubmit not available
      }
    } catch (error) {
      console.error("Error creating product:", error.response?.data || error);
      setPopupMessage("Error while creating product");
      setShowPopup(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="space-y-6"
      >
        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Basic Info */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Basic Information</h3>
              {[
                { label: "Product Name", name: "product_name", required: true },
                { label: "Product ID", name: "product_id", required: true },
                { label: "Brand", name: "brand", required: true },
                { label: "SKU", name: "sku", required: true },
              ].map(({ label, name, required, type = "text" }) => (
                <div key={name} className="mb-4">
                  <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
                    {label}{required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    type={type}
                    name={name}
                    id={name}
                    onChange={handleChange}
                    value={formData[name]}
                    required={required}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Pricing Details</h3>
              {[
                { label: "Merchant Price ($)", name: "merchant_price", type: "number", required: true },
                { label: "Margin (%)", name: "margin", type: "number", required: true },
                { label: "Tax (%)", name: "tax", type: "number", required: true },
              ].map(({ label, name, type, required }) => (
                <div key={name} className="mb-4">
                  <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
                    {label}{required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    type={type}
                    name={name}
                    id={name}
                    onChange={handleChange}
                    value={formData[name]}
                    required={required}
                    min="0"
                    step={name === "merchant_price" ? "0.01" : "0.1"}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Right Column - Additional Details */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Product Details</h3>
              
              {/* Category Dropdown */}
              <div className="mb-4">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category<span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  name="category"
                  id="category"
                  onChange={handleChange}
                  value={formData.category}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category.toLowerCase()}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Gender Radio Buttons */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender<span className="text-red-500 ml-1">*</span>
                </label>
                <div className="flex space-x-4">
                  {["male", "female", "unisex", "Boys", "Girls"].map((gender) => (
                    <label key={gender} className="inline-flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value={gender}
                        checked={formData.gender === gender}
                        onChange={handleChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">{gender}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Sizes Checkboxes */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Sizes<span className="text-red-500 ml-1">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSizeChange(size)}
                      className={`px-3 py-2 border ${
                        formData.size.includes(size)
                          ? "bg-indigo-100 border-indigo-500 text-indigo-800"
                          : "bg-white border-gray-300 text-gray-700"
                      } rounded-md text-sm font-medium transition-colors`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {formData.size.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">Please select at least one size</p>
                )}
              </div>
              
              {/* Colors Checkboxes */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Colors<span className="text-red-500 ml-1">*</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {colorOptions.map((color) => (
                    <div key={color.name} className="relative">
                      <button
                        type="button"
                        onClick={() => handleColorChange(color.name)}
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color.includes(color.name)
                            ? "border-indigo-500 ring-2 ring-indigo-200"
                            : "border-gray-300"
                        } transition-all focus:outline-none`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      >
                        {formData.color.includes(color.name) && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white drop-shadow-md" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </span>
                        )}
                      </button>
                      <span className="block text-xs text-center mt-1">{color.name}</span>
                    </div>
                  ))}
                </div>
                {formData.color.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">Please select at least one color</p>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="tag" className="block text-sm font-medium text-gray-700 mb-1">
                  Tag
                </label>
                <input
                  type="text"
                  name="tag"
                  id="tag"
                  onChange={handleChange}
                  value={formData.tag}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Additional Information</h3>
              <div className="mb-4">
                <label htmlFor="additional_info" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Info
                </label>
                <input
                  type="text"
                  name="additional_info"
                  id="additional_info"
                  onChange={handleChange}
                  value={formData.additional_info}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="short_description" className="block text-sm font-medium text-gray-700 mb-1">
                  Short Description<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  name="short_description"
                  id="short_description"
                  onChange={handleChange}
                  value={formData.short_description}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Full Width - Description */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Full Description<span className="text-red-500 ml-1">*</span>
          </label>
          <textarea
            name="description"
            id="description"
            rows="4"
            onChange={handleChange}
            value={formData.description}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          ></textarea>
        </div>
        
        {/* Image Upload Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <label htmlFor="product_image" className="block text-sm font-medium text-gray-700 mb-1">
            Product Images<span className="text-red-500 ml-1">*</span>
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors duration-200">
            <input
              type="file"
              name="product_image"
              id="product_image"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              required={uploadedFiles.length === 0}
              className="hidden"
            />
            <label
              htmlFor="product_image"
              className="cursor-pointer flex flex-col items-center justify-center"
            >
              <svg
                className="w-12 h-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-600">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to 10MB
              </p>
            </label>
          </div>
          
          {/* Preview Images */}
          {uploadedFiles.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={file.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updatedFiles = [...uploadedFiles];
                      updatedFiles.splice(index, 1);
                      setUploadedFiles(updatedFiles);
                      
                      // Update the form data product_image field
                      const dataTransfer = new DataTransfer();
                      Array.from(formData.product_image).forEach((file, i) => {
                        if (i !== index) {
                          dataTransfer.items.add(file);
                        }
                      });
                      setFormData({
                        ...formData,
                        product_image: dataTransfer.files,
                      });
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || formData.size.length === 0 || formData.color.length === 0}
            className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${
              isSubmitting || formData.size.length === 0 || formData.color.length === 0
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          >
            {isSubmitting ? "Creating..." : "Create Product"}
          </button>
        </div>
      </form>
      
      {showPopup && (
        <Popup message={popupMessage} onClose={closePopup} />
      )}
    </>
  );
};

export default ProductForm;
