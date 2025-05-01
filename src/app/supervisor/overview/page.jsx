"use client";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

import { useEffect, useState } from "react";
import axios from "axios";
import OverviewCard from "../components/OverviewCard";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { useRouter } from "next/navigation";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

export default function OverviewPage() {
  const [salesTrend, setSalesTrend] = useState([]);
  const [orderTrend, setOrderTrend] = useState([]);
  const [stockStatus, setStockStatus] = useState({});
  const [lowStockCount, setLowStockCount] = useState(0);
  const [timeFrame, setTimeFrame] = useState("week");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("supervisorToken");
        const adminToken = localStorage.getItem("adminToken");
        
        // If there's no supervisor token or if there's an admin token, redirect to login
        if (!token || adminToken) {
            localStorage.removeItem("adminToken"); // Clean up any admin token
            router.push("/supervisor/login"); // Redirect to login page
            return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        // Fetch Sales Trend
        const salesResponse = await axios.get(
          `${apiBaseUrl}/sup/admin/salestrend?time_frame=${timeFrame}`,
          { headers }
        );
        setSalesTrend(salesResponse.data.sales_trend);

        // Fetch Order Trend
        const ordersResponse = await axios.get(
          `${apiBaseUrl}/sup/admin/ordertrend?time_frame=${timeFrame}`,
          { headers }
        );
        setOrderTrend(ordersResponse.data.order_trend);

        // Fetch Stock Status
        const stockResponse = await axios.get(
          `${apiBaseUrl}/sup/admin/stockstatus`,
          { headers }
        );
        setStockStatus(stockResponse.data.stock_status);

        // Fetch Low Stock Items
        const inventoryResponse = await axios.get(
          `${apiBaseUrl}/sup/fetchallinventory`,
          { headers }
        );
        const lowStockItems = inventoryResponse.data.filter(
          (item) => item.stock < item.threshold
        );
        setLowStockCount(lowStockItems.length);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          router.push("/supervisor/login");
        } else {
          setError(err.message || "Failed to fetch data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeFrame, router]);

  const salesChartData = {
    labels: Array.from({ length: salesTrend.length }, (_, i) => `Day ${i + 1}`),
    datasets: [
      {
        label: "Sales",
        data: salesTrend,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
    ],
  };

  const orderChartData = {
    labels: Array.from({ length: orderTrend.length }, (_, i) => `Day ${i + 1}`),
    datasets: [
      {
        label: "Orders",
        data: orderTrend,
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
      },
    ],
  };

  const stockChartData = {
    labels: Object.keys(stockStatus),
    datasets: [
      {
        label: "Stock Status",
        data: Object.values(stockStatus),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      },
    ],
  };

  if (loading) {
    return <p>Loading data...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-blue-50">
      {/* Overview Cards */}
      <OverviewCard
        title="Total Sales"
        value={`₹${salesTrend.reduce((acc, val) => acc + val, 0).toFixed(2)}`}
        bgColor="bg-gradient-to-r from-blue-500 to-blue-600"
      />
      <OverviewCard
        title="Total Orders"
        value={orderTrend.reduce((acc, val) => acc + val, 0)}
        bgColor="bg-gradient-to-r from-blue-600 to-blue-700"
      />
      <OverviewCard
        title="Low Stock Alerts"
        value={lowStockCount} // Display the low stock count
        bgColor="bg-gradient-to-r from-red-500 to-red-600"
      />

      {/* Sales Trend and Order Trend Charts */}
      <div className="col-span-1 md:col-span-1 bg-white p-6 rounded-lg shadow-md border border-blue-100">
        <h2 className="text-lg font-semibold mb-4 text-blue-800">Sales Trend</h2>
        <div className="h-60">
          <Line data={salesChartData} />
        </div>
      </div>
      <div className="col-span-1 md:col-span-1 bg-white p-6 rounded-lg shadow-md border border-blue-100">
        <h2 className="text-lg font-semibold mb-4 text-blue-800">Order Trend</h2>
        <div className="h-60">
          <Line data={orderChartData} />
        </div>
      </div>

      {/* Stock Status Chart */}
      <div className="col-span-1 md:col-span-1 bg-white p-6 rounded-lg shadow-md border border-blue-100">
        <h2 className="text-lg font-semibold mb-4 text-blue-800">Stock Status</h2>
        <div className="h-60">
          <Pie data={stockChartData} />
        </div>
      </div>

      {/* Time Frame Buttons */}
      <div className="col-span-1 md:col-span-3 flex flex-wrap justify-end gap-2 mt-4">
        <button
          onClick={() => setTimeFrame("week")}
          className={`px-4 py-2 rounded-md shadow transition-all ${timeFrame === "week" ? "bg-blue-600 text-white font-semibold" : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"}`}
        >
          This Week
        </button>
        <button
          onClick={() => setTimeFrame("month")}
          className={`px-4 py-2 rounded-md shadow transition-all ${timeFrame === "month" ? "bg-blue-600 text-white font-semibold" : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"}`}
        >
          This Month
        </button>
        <button
          onClick={() => setTimeFrame("3month")}
          className={`px-4 py-2 rounded-md shadow transition-all ${timeFrame === "3month" ? "bg-blue-600 text-white font-semibold" : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"}`}
        >
          3 Months
        </button>
        <button
          onClick={() => setTimeFrame("6month")}
          className={`px-4 py-2 rounded-md shadow transition-all ${timeFrame === "6month" ? "bg-blue-600 text-white font-semibold" : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"}`}
        >
          6 Months
        </button>
        <button
          onClick={() => setTimeFrame("year")}
          className={`px-4 py-2 rounded-md shadow transition-all ${timeFrame === "year" ? "bg-blue-600 text-white font-semibold" : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"}`}
        >
          This Year
        </button>
        <button
          onClick={() => setTimeFrame("all")}
          className={`px-4 py-2 rounded-md shadow transition-all ${timeFrame === "all" ? "bg-blue-600 text-white font-semibold" : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"}`}
        >
          All Time
        </button>
      </div>
    </div>
  );
}
