"use client";

import React, { useState } from "react";
import OrderTable from "../components/OrderTable";
import OrderDetailsModal from "../components/OrderDetailsModal";

const dummyOrders = [
  {
    id: 1,
    customer: "John Doe",
    total: 120,
    status: "Pending",
    items: [
      { name: "T-Shirt", quantity: 2, price: 20 },
      { name: "Jeans", quantity: 1, price: 80 },
    ],
  },
  {
    id: 2,
    customer: "Jane Smith",
    total: 70,
    status: "Shipped",
    items: [
      { name: "Jacket", quantity: 1, price: 70 },
    ],
  },
];

export default function OrderManagementPage() {
  const [orders, setOrders] = useState(dummyOrders);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUpdateStatus = (id, newStatus) => {
    setOrders(
      orders.map((order) =>
        order.id === id ? { ...order, status: newStatus } : order
      )
    );
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Order Management</h1>
      <OrderTable
        orders={orders}
        onUpdateStatus={handleUpdateStatus}
        onViewDetails={handleViewDetails}
      />
      <OrderDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
      />
    </div>
  );
}
