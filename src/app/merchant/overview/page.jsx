"use client";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import OverviewCard from "../components/OverviewCard";
import { Line, Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { CalendarDays, TrendingUp, Activity, ArrowRight, ShoppingCart } from "lucide-react";

// Register Chart.js components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement, 
  Title, 
  Tooltip, 
  Legend
);

export default function OverviewPage() {
  const router = useRouter();
  const [salesTrend, setSalesTrend] = useState([]);
  const [orderTrend, setOrderTrend] = useState([]);
  const [stockStatus, setStockStatus] = useState({});
  const [lowStockCount, setLowStockCount] = useState(0);
  const [timeFrame, setTimeFrame] = useState("week");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [salesLabels, setSalesLabels] = useState([]);
  const [orderLabels, setOrderLabels] = useState([]);

  // Add auth check on page load
  useEffect(() => {
    const token = localStorage.getItem("merctoken");
    if (!token) {
      router.push("/merchant/login");
    }
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      // Flag to track if we've redirected
      let hasRedirected = false;
      
      try {
        const token = localStorage.getItem("merctoken");
        
        // Check token again before making API calls
        if (!token) {
          router.push("/merchant/login");
          return;
        }

        // Ensure token is properly formatted
        const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        const headers = { 
          Authorization: formattedToken,
          'Content-Type': 'application/json'
        };

        console.log('Making API calls with token:', formattedToken.substring(0, 20) + '...');

        // Helper function to handle redirects
        const handleErrorAndRedirect = (err) => {
          if (hasRedirected) return { redirect: true };
          
          console.error('API error:', err.response?.data || err.message);
          
          if (err.response?.data?.error === 'on hold') {
            hasRedirected = true;
            router.push("/merchant/hold");
            return { redirect: true };
          } else if (err.response?.status === 401) {
            hasRedirected = true;
            localStorage.removeItem("merctoken");
            router.push("/merchant/login");
            return { redirect: true };
          } else if (err.response?.status === 403 && err.response?.data?.error === "pending") {
            hasRedirected = true;
            router.push("/merchant/pending");
            return { redirect: true };
          }
          
          return { redirect: false };
        };

        // Fetch data sequentially to avoid multiple redirects
        let response;
        
        // Sales trend
        response = await axios.get(`${apiBaseUrl}/api/sales-trend?time_frame=${timeFrame}`, { headers })
          .catch(err => {
            const result = handleErrorAndRedirect(err);
            if (result.redirect) return null;
            return { data: { sales_trend: [], labels: [] } };
          });
        
        if (hasRedirected) return;
        const salesResponse = response;
        
        // Order trend
        response = await axios.get(`${apiBaseUrl}/api/order-trend?time_frame=${timeFrame}`, { headers })
          .catch(err => {
            const result = handleErrorAndRedirect(err);
            if (result.redirect) return null;
            return { data: { order_trend: [], labels: [] } };
          });
        
        if (hasRedirected) return;
        const ordersResponse = response;
        
        // Stock status
        response = await axios.get(`${apiBaseUrl}/api/stock-status`, { headers })
          .catch(err => {
            const result = handleErrorAndRedirect(err);
            if (result.redirect) return null;
            return { data: { stock_status: {} } };
          });
        
        if (hasRedirected) return;
        const stockResponse = response;
        
        // Inventory
        response = await axios.get(`${apiBaseUrl}/merchantinventory`, { headers })
          .catch(err => {
            const result = handleErrorAndRedirect(err);
            if (result.redirect) return null;
            return { data: [] };
          });
        
        if (hasRedirected) return;
        const inventoryResponse = response;
        
        // Update state with fetched data, handling possible null values
        setSalesTrend(salesResponse.data?.sales_trend || []);
        setSalesLabels(salesResponse.data?.labels || []);
        setOrderTrend(ordersResponse.data?.order_trend || []);
        setOrderLabels(ordersResponse.data?.labels || []);
        setStockStatus(stockResponse.data?.stock_status || {});
        
        const lowStockItems = (inventoryResponse.data || []).filter(item => 
          (item?.stock || 0) < (item?.threshold || 10)
        );
        setLowStockCount(lowStockItems.length);
        
        // Keep this empty since we're not fetching it
        setRecentOrders([]);
      } catch (error) {
        if (hasRedirected) return;
        
        console.error("Error fetching data:", error);
        console.error("Error response:", error.response?.data);
        setError("Failed to load dashboard data. Please try again later.");
        
        // Check if direct error object with 'on hold'
        if (error.response?.data?.error === 'on hold') {
          router.push("/merchant/hold");
          return;
        }
        
        if (error.response) {
          if (error.response.status === 401) {
            localStorage.removeItem("merctoken"); // Clear invalid token
            router.push("/merchant/login");
          } else if (error.response.status === 403 && error.response.data.error === "pending") {
            router.push("/merchant/pending");
          } else if (error.response.status === 403 && error.response.data.error === "on hold") {
            router.push("/merchant/hold");
          }
        }
      } finally {
        if (!hasRedirected) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [timeFrame, router]);

  // Calculate total sales and trend percentage
  const totalSales = salesTrend.reduce((acc, val) => acc + (val || 0), 0);
  const previousSales = totalSales * 0.8; // Mock data for comparison
  const salesTrendPercentage = previousSales ? Math.round((totalSales - previousSales) / previousSales * 100) : 0;
  
  // Calculate total orders and trend percentage 
  const totalOrders = orderTrend.reduce((acc, val) => acc + (val || 0), 0);
  const previousOrders = totalOrders * 0.9; // Mock data for comparison
  const ordersTrendPercentage = previousOrders ? Math.round((totalOrders - previousOrders) / previousOrders * 100) : 0;

  // Chart configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 6
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#334155',
        bodyColor: '#64748b',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        boxWidth: 8,
        usePointStyle: true,
        bodyFont: {
          family: 'Inter, system-ui, sans-serif'
        },
        titleFont: {
          family: 'Inter, system-ui, sans-serif',
          weight: 'bold'
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(226, 232, 240, 0.5)'
        }
      }
    }
  };

  // Generate date labels for the charts
  const generateDateLabels = () => {
    const today = new Date();
    return Array.from({ length: salesTrend.length }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }).reverse();
  };

  // Sales Trend Chart Data
  const salesChartData = {
    labels: salesLabels.length > 0 ? salesLabels : generateDateLabels(),
    datasets: [
      {
        label: "Sales (₹)",
        data: salesTrend,
        borderColor: "rgba(99, 102, 241, 1)",
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 3,
        pointBackgroundColor: "#fff",
        pointBorderColor: "rgba(99, 102, 241, 1)",
        pointBorderWidth: 2,
        fill: true
      },
    ],
  };

  // Order Trend Chart Data
  const orderChartData = {
    labels: orderLabels.length > 0 ? orderLabels : generateDateLabels(),
    datasets: [
      {
        label: "Orders",
        data: orderTrend,
        borderColor: "rgba(14, 165, 233, 1)",
        backgroundColor: "rgba(14, 165, 233, 0.2)",
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 3,
        pointBackgroundColor: "#fff",
        pointBorderColor: "rgba(14, 165, 233, 1)",
        pointBorderWidth: 2,
        fill: true
      },
    ],
  };

  // Stock Status Chart Data
  const stockChartData = {
    labels: Object.keys(stockStatus),
    datasets: [
      {
        label: "Inventory",
        data: Object.values(stockStatus),
        backgroundColor: [
          "rgba(99, 102, 241, 0.7)",
          "rgba(14, 165, 233, 0.7)",
          "rgba(249, 115, 22, 0.7)",
          "rgba(239, 68, 68, 0.7)"
        ],
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-lg p-6 bg-red-50 rounded-lg border border-red-100">
          <div className="text-red-500 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Error Loading Data</h3>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Frame Selector */}
      <div className="flex flex-wrap items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2 text-gray-700">
          <CalendarDays className="h-5 w-5 text-indigo-500" />
          <h3 className="font-medium">Time Period</h3>
        </div>
        <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
          {[
            { label: "Week", value: "week" },
            { label: "Month", value: "month" },
            { label: "3 Months", value: "3month" },
            { label: "6 Months", value: "6month" },
            { label: "Year", value: "year" },
            { label: "All Time", value: "all" },
          ].map((period) => (
            <button
              key={period.value}
              onClick={() => setTimeFrame(period.value)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                timeFrame === period.value 
                  ? "bg-indigo-600 text-white shadow-sm" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <OverviewCard
          title="Total Sales"
          value={`₹${totalSales.toFixed(2)}`}
          bgColor="bg-indigo"
          percentage={salesTrendPercentage}
          trend={salesTrendPercentage > 0 ? "up" : salesTrendPercentage < 0 ? "down" : "neutral"}
        />
        <OverviewCard
          title="Total Orders"
          value={totalOrders}
          bgColor="bg-blue"
          percentage={ordersTrendPercentage}
          trend={ordersTrendPercentage > 0 ? "up" : ordersTrendPercentage < 0 ? "down" : "neutral"}
        />
        <OverviewCard
          title="Low Stock Alerts"
          value={lowStockCount}
          bgColor="bg-orange"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-indigo-100 rounded-md">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Sales Trend</h2>
            </div>
            <a href="/merchant/orders" className="text-sm text-indigo-600 flex items-center hover:underline">
              <span>View Orders</span>
              <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </div>
          <div className="h-80">
            <Line data={salesChartData} options={chartOptions} />
          </div>
        </div>

        {/* Stock Status Chart */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-md">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Inventory Status</h2>
            </div>
            <a href="/merchant/inventory" className="text-sm text-blue-600 flex items-center hover:underline">
              <span>View All</span>
              <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </div>
          <div className="h-80 flex items-center justify-center">
            {Object.keys(stockStatus).length > 0 ? (
              <Pie data={stockChartData} />
            ) : (
              <p className="text-gray-500 text-center">No inventory data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Order Trend Chart */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-md">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Order Trend</h2>
          </div>
        </div>
        <div className="h-72">
          <Bar data={orderChartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}
