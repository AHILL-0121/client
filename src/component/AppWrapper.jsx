"use client"; // Ensures this component is treated as a client-side component

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation"; // To get the current pathname
import dynamic from "next/dynamic"; // Dynamic import to disable SSR for Navigation
import { motion, AnimatePresence } from "framer-motion";

// Dynamically import the Navigation component with ssr: false
const Navigation = dynamic(() => import("./Landing_Page/Navbar/Navigation"), {
  ssr: false, // Disable server-side rendering for the Navigation component
});

import Footer from "./Landing_Page/Footer/Footer"; // Import Footer directly

// Define page transition animations
const pageVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

export function AppWrapper({ children }) {
  const pathname = usePathname(); // Get the current path
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // Paths that should show navigation
  const showNavPaths = [
    "/", "/about", "/contact", "/join", "/homeimage", 
    "/Shoppingbag", "/checkout", "/payment", "/account", 
    "/wishlist", "/yourorder", "/login", "/signup", 
    "/shipadd", "/products", "/checkoutpage", "/paysuccess"
  ];
  
  // Paths that should show footer
  const showFooterPaths = [
    "/", "/about", "/contact", "/join", "/homeimage",
    "/Shoppingbag", "/wishlist", "/products", "/yourorder"
  ];
  
  // Check if current path or path prefix should show navigation
  const shouldShowNav = 
    showNavPaths.includes(pathname) || 
    pathname.startsWith("/products/");
  
  // Check if current path or path prefix should show footer
  const shouldShowFooter = 
    showFooterPaths.includes(pathname) || 
    pathname.startsWith("/products/");

  // Handle scroll progress for progress bar
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPosition = window.scrollY;
      const progress = (scrollPosition / totalScroll) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Progress bar */}
      <div 
        className="fixed top-0 left-0 right-0 h-1 bg-[#024E82] z-[100] transform-gpu"
        style={{ width: `${scrollProgress}%`, opacity: scrollProgress > 0 ? 1 : 0 }}
      />

      {/* Navigation */}
      {shouldShowNav && <Navigation />}

      {/* Main content */}
      <AnimatePresence mode="wait">
        <motion.main 
          key={pathname}
          className="flex-grow"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
        >
          {children}
        </motion.main>
      </AnimatePresence>

      {/* Footer */}
      {shouldShowFooter && <Footer />}
    </div>
  );
}
