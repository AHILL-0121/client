"use client"; // Required for client-side rendering
import React, { useState, useRef, useEffect } from "react";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [showForm, setShowForm] = useState(false); // For toggling form visibility
  const [editMode, setEditMode] = useState(false); // Whether the form is in edit mode
  const [currentAddress, setCurrentAddress] = useState(null); // Current address being edited
  const [addresses, setAddresses] = useState([
    {
      name: "Gopal VS",
      address:
        "91A Rainbow Street, Mettupalayam Subdistrict, Coimbatore District, Tamil Nadu - 641300",
      locality: "Mettupalayam",
      pincode: "641300",
      city: "Coimbatore District",
      state: "Tamil Nadu",
      landmark: "Near Bus stop",
      mobile: "9876543210",
      type: "Home",
    },
  ]);
  
  const [popupOpen, setPopupOpen] = useState(null); // Track which popup is open (if any)

  const popupRef = useRef(null); // Reference to the popup for closing when clicking outside

  // Close the popup if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setPopupOpen(null); // Close popup if clicked outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Open the form for adding a new address
  const handleAddNewAddress = () => {
    setShowForm(true);
    setEditMode(false);
    setCurrentAddress(null);
  };

  // Open the form for editing an existing address
  const handleEditAddress = (index) => {
    setCurrentAddress({ ...addresses[index], index });
    setShowForm(true);
    setEditMode(true);
  };

  // Handle form submission
  const handleFormSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const newAddress = {
      name: formData.get("name"),
      address: formData.get("address"),
      locality: formData.get("locality"),
      pincode: formData.get("pincode"),
      city: formData.get("city"),
      state: formData.get("state"),
      landmark: formData.get("landmark"),
      mobile: formData.get("mobile"),
      type: formData.get("type"),
    };

    if (editMode) {
      // Update the address
      setAddresses((prev) =>
        prev.map((addr, idx) =>
          idx === currentAddress.index ? newAddress : addr
        )
      );
    } else {
      // Add a new address
      setAddresses((prev) => [...prev, newAddress]);
    }

    setShowForm(false);
  };

  // Delete an address
  const handleDeleteAddress = (index) => {
    setAddresses((prev) => prev.filter((_, i) => i !== index));
  };

  // Toggle popup visibility
  const togglePopup = (index) => {
    if (popupOpen === index) {
      setPopupOpen(null); // Close if the same address is clicked again
    } else {
      setPopupOpen(index); // Open the popup for the clicked address
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      {/* Tab Navigation */}
      <div className="flex w-full max-w-4xl justify-center space-x-6 mt-8">
        <button
          className={`py-2 px-4 text-sm font-semibold ${
            activeTab === "profile"
              ? "bg-black text-white"
              : "bg-gray-300 text-black"
          } rounded-md`}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>
        <button
          className={`py-2 px-4 text-sm font-semibold ${
            activeTab === "address"
              ? "bg-black text-white"
              : "bg-gray-300 text-black"
          } rounded-md`}
          onClick={() => setActiveTab("address")}
        >
          Manage Address
        </button>
        <button
          className={`py-2 px-4 text-sm font-semibold ${
            activeTab === "orders"
              ? "bg-black text-white"
              : "bg-gray-300 text-black"
          } rounded-md`}
          onClick={() => setActiveTab("orders")}
        >
          Your Orders
        </button>
      </div>

      {/* Animated Transition */}
      <div
        className={"transition-all ease-in-out duration-300 mt-6 w-full max-w-4xl bg-white p-6 rounded-md shadow-lg"}
      >
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Personal Information</h2>
            <input
              type="text"
              placeholder="Username"
              className="w-full p-3 border rounded-md mb-4"
            />
            <h3 className="text-sm font-semibold mb-2">Your Gender</h3>
            <div className="flex space-x-4 mb-4">
              <label className="flex items-center space-x-2">
                <input type="radio" name="gender" />
                <span>Male</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="radio" name="gender" />
                <span>Female</span>
              </label>
            </div>
            <input
              type="email"
              placeholder="Email Address"
              className="w-full p-3 border rounded-md mb-4"
            />
            <input
              type="tel"
              placeholder="Mobile Number"
              className="w-full p-3 border rounded-md mb-4"
            />
            <div className="flex justify-between mt-4">
              <button className="text-red-500">Deactivate Account</button>
              <button className="text-red-500">Delete Account</button>
            </div>
          </div>
        )}

        {/* Manage Address Tab */}
        {activeTab === "address" && (
          <div>
            <button
              onClick={handleAddNewAddress}
              className="bg-purple-600 text-white px-4 py-2 rounded-md mb-6"
            >
              + Add A New Address
            </button>

            {/* Address Form */}
            {showForm && (
              <form
                onSubmit={handleFormSubmit}
                className="bg-purple-100 p-6 rounded-md mb-6"
              >
                <h3 className="text-lg font-bold mb-4">
                  {editMode ? "Edit Address" : "Add A New Address"}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    name="name"
                    defaultValue={currentAddress?.name || ""}
                    placeholder="Name"
                    className="p-3 border rounded-md"
                    required
                  />
                  <input
                    name="mobile"
                    defaultValue={currentAddress?.mobile || ""}
                    placeholder="10-digit mobile number"
                    className="p-3 border rounded-md"
                    required
                  />
                  <input
                    name="pincode"
                    defaultValue={currentAddress?.pincode || ""}
                    placeholder="Pincode"
                    className="p-3 border rounded-md"
                    required
                  />
                  <input
                    name="locality"
                    defaultValue={currentAddress?.locality || ""}
                    placeholder="Locality"
                    className="p-3 border rounded-md"
                    required
                  />
                  <textarea
                    name="address"
                    defaultValue={currentAddress?.address || ""}
                    placeholder="Address (Area and Street)"
                    className="p-3 border rounded-md col-span-2"
                    required
                  />
                  <input
                    name="city"
                    defaultValue={currentAddress?.city || ""}
                    placeholder="City/District/Town"
                    className="p-3 border rounded-md"
                    required
                  />
                  <input
                    name="state"
                    defaultValue={currentAddress?.state || ""}
                    placeholder="State"
                    className="p-3 border rounded-md"
                    required
                  />
                  <input
                    name="landmark"
                    defaultValue={currentAddress?.landmark || ""}
                    placeholder="Landmark (Optional)"
                    className="p-3 border rounded-md"
                  />
                  <input
                    name="type"
                    defaultValue={currentAddress?.type || "Home"}
                    placeholder="Work or Home"
                    className="p-3 border rounded-md"
                  />
                </div>
                <div className="flex justify-end space-x-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="text-red-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-purple-600 text-white px-4 py-2 rounded-md"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}

            {/* Saved Addresses */}
            {addresses.map((address, index) => (
              <div
                key={index}
                className="flex justify-between items-center border p-4 rounded-md mb-4"
              >
                <div>
                  <h4 className="font-semibold">{address.name}</h4>
                  <p className="text-sm text-gray-500">{address.address}</p>
                </div>
                <div className="relative">
                  <button onClick={() => togglePopup(index)} className="text-black">
                    ⋮
                  </button>
                  {popupOpen === index && (
                    <div
                      ref={popupRef}
                      className="absolute right-0 mt-2 bg-white shadow-lg rounded-md p-2"
                    >
                      <button
                        onClick={() => handleEditAddress(index)}
                        className="block w-full text-left px-4 py-2 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(index)}
                        className="block w-full text-left px-4 py-2 text-sm text-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Your Orders Tab */}
        {activeTab === "orders" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Your Orders</h2>
            <p>You have no orders yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}