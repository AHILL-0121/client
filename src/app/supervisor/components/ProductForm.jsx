import React, { useState } from "react";
import axios from "axios";
import Popup from "@/component/Landing_Page/CheckoutPage/Popup";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;


const ProductForm = ({ handleCloseForm }) => {
  const [popupMessage, setPopupMessage] = useState(""); // State to control popup message
  const [showPopup, setShowPopup] = useState(false); // State to control popup visibility
const closePopup = () => {
    setShowPopup(false);
  };
  const [formData, setFormData] = useState({
    product_id: "",
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, product_image: e.target.files });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "product_image") {
        for (let i = 0; i < formData.product_image.length; i++) {
          data.append("product_image", formData.product_image[i]);
        }
      } else {
        data.append(key, formData[key]);
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
      handleCloseForm();  // Hide form after successful submit
    } catch (error) {
      console.error("Error creating product:", error.response?.data || error);
      setPopupMessage("Error creating product.");
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
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Create Product
      </h2>

      {/* Grid Layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Input Fields */}
        {[
          { label: "Product ID", name: "product_id" },
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
          <label
            htmlFor="additional_info"
            className="text-gray-600 font-semibold mb-2 block"
          >
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
          <label
            htmlFor="description"
            className="text-gray-600 font-semibold mb-2 block"
          >
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
          <label
            htmlFor="product_image"
            className="text-gray-600 font-semibold mb-2 block"
          >
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

      {/* Submit Button */}
      <div className="flex justify-center mt-8">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
        >
          Submit Product
        </button>
      </div>

      {/* Cancel Button */}
      <div className="flex justify-center mt-4">
        <button
          type="button"
          onClick={handleCloseForm}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
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

export default ProductForm;
