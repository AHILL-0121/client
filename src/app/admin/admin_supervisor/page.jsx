"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Popup from "@/component/Landing_Page/CheckoutPage/Popup";
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const AdminSupervisors = () => {
  const [popupMessage, setPopupMessage] = useState(""); // State to control popup message
  const [showPopup, setShowPopup] = useState(false); // State to control popup visibility
  const [popupType, setPopupType] = useState("success");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [supervisorToDelete, setSupervisorToDelete] = useState(null);
  const router = useRouter();

  const closePopup = () => {
    setShowPopup(false);
  };

  const closeConfirmDialog = () => {
    setShowConfirmDialog(false);
    setSupervisorToDelete(null);
  };

  const [supervisors, setSupervisors] = useState([]);
  const [newSupervisor, setNewSupervisor] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    phone_number: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch the admin token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("adminToken");
  };

  // Fetch all admin supervisors
  const fetchSupervisors = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        router.push("/admin/login"); // Redirect if no token found
        return;
      }

      const response = await axios.get(`${apiBaseUrl}/allsupervisors`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSupervisors(response.data.admin_supervisors);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        router.push("/admin/login"); // Redirect on Unauthorized (401)
      } else {
        console.error("Error fetching supervisors:", error);
      }
    }
  };

  useEffect(() => {
    fetchSupervisors();
  }, [router]);

  // Handle input change for the new supervisor form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSupervisor({ ...newSupervisor, [name]: value });
  };

  // Add a new admin supervisor
  const handleAddSupervisor = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        router.push("/admin/login"); // Redirect if no token found
        return;
      }

      const response = await axios.post(
        `${apiBaseUrl}/adminsupervisor`,
        newSupervisor,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
     
      setPopupMessage("Admin Supervisor added successfully!");
        setShowPopup(true);

      // Refetch the list of supervisors after adding the new supervisor
      fetchSupervisors();

      // Clear the form
      setNewSupervisor({ name: "", username: "", email: "", password: "", phone_number: "" });
      
    } catch (error) {
      if (error.response && error.response.status === 401) {
        router.push("/admin/login"); // Redirect on Unauthorized (401)
      } else {
        console.error("Error adding supervisor:", error);
        setPopupMessage("Failed to add supervisor.");
        setShowPopup(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Delete an admin supervisor
  const handleDeleteSupervisor = async (superadmin_id) => {
    setSupervisorToDelete(superadmin_id);
    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        router.push("/admin/login");
        return;
      }

      await axios.delete(`${apiBaseUrl}/adminsupervisor/${supervisorToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPopupMessage("Supervisor deleted successfully!");
      setPopupType("success");
      setShowPopup(true);
      fetchSupervisors();
    } catch (error) {
      if (error.response && error.response.status === 401) {
        router.push("/admin/login");
      } else {
        console.error("Error deleting supervisor:", error);
        setPopupMessage("Failed to delete supervisor.");
        setPopupType("error");
        setShowPopup(true);
      }
    } finally {
      closeConfirmDialog();
    }
  };

  return (
    <>
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Supervisors</h1>

      {/* Add New Supervisor Form */}
      <form
        onSubmit={handleAddSupervisor}
        className="mb-6 p-4 border border-gray-300 rounded"
      >
        <h2 className="text-xl font-bold mb-4">Add New Admin Supervisor</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-gray-600">Name</label>
            <input
              type="text"
              name="name"
              value={newSupervisor.name}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-600">Username</label>
            <input
              type="text"
              name="username"
              value={newSupervisor.username}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-600">Email</label>
            <input
              type="email"
              name="email"
              value={newSupervisor.email}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-600">Phone Number</label>
            <input
              type="text"
              name="phone_number"
              value={newSupervisor.phone_number}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-600">Password</label>
            <input
              type="password"
              name="password"
              value={newSupervisor.password}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className={`mt-4 bg-blue-500 text-white px-4 py-2 rounded ${
            isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
          }`}
          disabled={isLoading}
        >
          {isLoading ? "Adding..." : "Add Supervisor"}
        </button>
      </form>

      {/* Supervisors Table */}
      <table className="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">Name</th>
            <th className="border border-gray-300 px-4 py-2">Username</th>
            <th className="border border-gray-300 px-4 py-2">Email</th>
            <th className="border border-gray-300 px-4 py-2">Phone Number</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {supervisors.map((sup) => (
            <tr key={sup.superadmin_id} className="text-center">
              <td className="border border-gray-300 px-4 py-2">{sup.name}</td>
              <td className="border border-gray-300 px-4 py-2">{sup.username}</td>
              <td className="border border-gray-300 px-4 py-2">{sup.email}</td>
              <td className="border border-gray-300 px-4 py-2">{sup.phone_number || "N/A"}</td>
              <td className="border border-gray-300 px-4 py-2">
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  onClick={() => handleDeleteSupervisor(sup.superadmin_id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Confirmation Dialog */}
    {showConfirmDialog && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
          <p className="text-gray-600 mb-6">Are you sure you want to delete this supervisor?</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={closeConfirmDialog}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Success/Error Popup */}
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

export default AdminSupervisors;
