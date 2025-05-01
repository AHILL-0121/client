import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';
import { createPortal } from 'react-dom';

const Popup = ({ message, onClose, type = 'success', autoClose = true, duration = 3000 }) => {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  // Function to get icon and background color based on type
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: <FiCheckCircle className="w-5 h-5" />,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-500',
          textColor: 'text-green-800',
          iconColor: 'text-green-500',
          ringColor: 'ring-green-500'
        };
      case 'error':
        return {
          icon: <FiAlertCircle className="w-5 h-5" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-500',
          textColor: 'text-red-800',
          iconColor: 'text-red-500',
          ringColor: 'ring-red-500'
        };
      case 'info':
        return {
          icon: <FiInfo className="w-5 h-5" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-500',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-500',
          ringColor: 'ring-blue-500'
        };
      default:
        return {
          icon: <FiCheckCircle className="w-5 h-5" />,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-500',
          textColor: 'text-green-800',
          iconColor: 'text-green-500',
          ringColor: 'ring-green-500'
        };
    }
  };

  const { icon, bgColor, borderColor, textColor, iconColor, ringColor } = getTypeStyles();

  // Create the popup content
  const popupContent = (
    <AnimatePresence>
      <div className="fixed inset-0 flex justify-center pointer-events-none" style={{ zIndex: 10000 }}>
        <div className="absolute top-4 px-4 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`pointer-events-auto overflow-hidden rounded-lg shadow-lg border-l-4 ${borderColor} ${bgColor}`}
          >
            <div className="p-4">
              <div className="flex items-start">
                <div className={`flex-shrink-0 ${iconColor}`}>
                  {icon}
                </div>
                <div className="ml-3 w-0 flex-1">
                  <p className={`text-sm font-medium ${textColor}`}>{message}</p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    onClick={onClose}
                    className={`rounded-md inline-flex ${textColor} hover:bg-gray-100 focus:outline-none focus:ring-2 focus:${ringColor}`}
                  >
                    <span className="sr-only">Close</span>
                    <FiX className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Progress bar for auto close */}
            {autoClose && (
              <div className="bg-gray-200 bg-opacity-40 h-1">
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: duration / 1000, ease: "linear" }}
                  className={`h-full ${iconColor.replace('text-', 'bg-')}`}
                />
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );

  // Use createPortal to render the popup directly to document.body
  return typeof document !== 'undefined' ? createPortal(popupContent, document.body) : null;
};

export default Popup;
