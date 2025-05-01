import React, { useState, useEffect } from "react";
import axios from "axios";
import Popup from "@/component/Landing_Page/CheckoutPage/Popup";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;


const EditProductForm = ({ selectedProduct, onSubmit, onClose, apiEndpoint }) => {
  const [popupMessage, setPopupMessage] = useState(""); // State to control popup message
  const [showPopup, setShowPopup] = useState(false); // State to control popup visibility
const closePopup = () => {
    setShowPopup(false);
  };
  const [formData, setFormData] = useState({
    product_name: "",
    short_description: "",
    description: "",
    size: "",
    color: "",
    sku: "",
    category: "",
    tag: "",
    additional_info: "",
    merchant_price: "",
    margin: "",
    tax: "",
    gender: "",
    brand: "",
    product_image: [],
  });
  const token = localStorage.getItem("merctoken");
  useEffect(() => {
    if (selectedProduct) {
      setFormData({
        product_name: selectedProduct.product_name,
        short_description: selectedProduct.short_description,
        description: selectedProduct.description,
        size: selectedProduct.size,
        color: selectedProduct.color,
        sku: selectedProduct.sku,
        category: selectedProduct.category,
        tag: selectedProduct.tag,
        additional_info: selectedProduct.additional_info,
        merchant_price: selectedProduct.merchant_price,
        margin: selectedProduct.margin,
        tax: selectedProduct.tax,
        gender: selectedProduct.gender,
        brand: selectedProduct.brand,
        product_image: selectedProduct.product_image,
      });
    }
  }, [selectedProduct]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, product_image: e.target.files });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const updatedProduct = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key !== "product_image") {
        updatedProduct.append(key, formData[key]);
      } else {
        for (let i = 0; i < formData.product_image.length; i++) {
          updatedProduct.append("product_image", formData.product_image[i]);
        }
      }
    });

    try {
      const response = await axios.put(`${apiBaseUrl}/updateproduct/${selectedProduct.product_id}`, updatedProduct, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`, // If your API uses token-based authentication
        },
      });
      
      if (response.status === 200) {
        onSubmit(response.data);
        setPopupMessage("Product updated successfully!");
        setShowPopup(true);
      } else {
        setPopupMessage("Failed to update the product.");
        setShowPopup(true);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      setPopupMessage("There was an error updating the product.");
        setShowPopup(true);
    }
  };

  return (
    <>
    <form
      onSubmit={handleSubmit}
      encType="multipart/form-data"
      className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md"
    >
      <div className="grid grid-cols-2 gap-6">
        {[ 
          { label: "Product Name", name: "product_name" },
          { label: "Short Description", name: "short_description" },
          { label: "Size", name: "size" },
          { label: "Color", name: "color" },
          { label: "SKU", name: "sku" },
          { label: "Category", name: "category" },
          { label: "Tag", name: "tag" },
          { label: "Merchant Price", name: "merchant_price", type: "number" },
          { label: "Margin", name: "margin", type: "number" },
          { label: "Tax", name: "tax", type: "number" },
          { label: "Gender", name: "gender" },
          { label: "Brand", name: "brand" },
        ].map(({ label, name, type = "text" }) => (
          <div key={name} className="flex flex-col">
            <label htmlFor={name} className="text-gray-600 font-semibold mb-2">
              {label}:
            </label>
            <input
              type={type}
              name={name}
              id={name}
              onChange={handleChange}
              value={formData[name]}
              required
              className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        ))}

        {/* Additional Info */}
        <div className="col-span-2">
          <label htmlFor="additional_info" className="text-gray-600 font-semibold mb-2 block">
            Additional Info:
          </label>
          <input
            type="text"
            name="additional_info"
            id="additional_info"
            onChange={handleChange}
            value={formData.additional_info}
            required
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Description */}
        <div className="col-span-2">
          <label htmlFor="description" className="text-gray-600 font-semibold mb-2 block">
            Description:
          </label>
          <textarea
            name="description"
            id="description"
            rows="4"
            onChange={handleChange}
            value={formData.description}
            required
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          ></textarea>
        </div>

        {/* File Upload */}
        <div className="col-span-2">
          <label htmlFor="product_image" className="text-gray-600 font-semibold mb-2 block">
            Product Images:
          </label>
          <input
            type="file"
            name="product_image"
            id="product_image"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            required
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
        >
          Submit Product
        </button>
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg ml-4"
        >
          Cancel
        </button>
      </div>
    </form>

    {showPopup && (
        <Popup message={popupMessage} onClose={closePopup} />
      )}
    </>
  );
};

export default EditProductForm;
