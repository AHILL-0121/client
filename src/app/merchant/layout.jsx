"use client";
import { usePathname } from "next/navigation";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

export default function MerchantLayout({ children }) {
  const pathname = usePathname();

  // Pages where the layout should be skipped
  const excludedRoutes = ["/merchant/login", "/merchant/register", "/merchant/pending"];

  if (excludedRoutes.includes(pathname)) {
    return <>{children}</>; // Render only the page content
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col pl-64">
        <Navbar />
        <main className="p-6 flex-grow">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        <footer className="p-4 text-center text-sm text-gray-500 border-t border-gray-200 bg-white bg-opacity-70 backdrop-blur-sm">
          © {new Date().getFullYear()} Merchant Dashboard. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
