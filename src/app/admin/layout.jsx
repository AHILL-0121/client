"use client";
import { usePathname } from "next/navigation";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  // Pages where the layout should be skipped
  const excludedRoutes = ["/admin/login"];

  if (excludedRoutes.includes(pathname)) {
    return <>{children}</>; // Render only the page content
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Column */}
      <div className="fixed left-0 top-0 h-full w-64 z-30">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col">
        <div className="sticky top-0 z-20">
          <Navbar />
        </div>
        <main className="p-6 bg-gray-50">
          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <nav className="text-sm text-blue-500 mb-4">
              <ol className="list-none p-0 inline-flex">
                <li className="flex items-center">
                  <a href="/admin/overview" className="hover:text-blue-700">Dashboard</a>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </li>
                <li className="text-blue-800 font-medium">
                  {pathname.split('/').pop().split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </li>
              </ol>
            </nav>
          </div>

          {/* Page Content */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            {children}
          </div>
        </main>
        
        {/* Footer */}
        <footer className="mt-auto p-4 text-center text-sm text-gray-500 border-t border-gray-200">
          <p>&copy; {new Date().getFullYear()} Admin Dashboard. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
