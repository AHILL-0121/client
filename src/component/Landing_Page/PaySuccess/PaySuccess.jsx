import React from 'react';
import Link from 'next/link'

export default function PaymentSuccess() {
  return (
    <div style={styles.container}>
      <div style={styles.checkmarkContainer}>
        <div style={styles.checkmark}></div>
      </div>
      <h2 style={styles.message}>Payment is Successful</h2>
      <Link href="/products">
        <button className="mt-5 px-6 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out">
          Return to Browsing Products
        </button>
      </Link>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f0f5f0',
  },
  checkmarkContainer: {
    width: '80px',
    height: '80px',
    backgroundColor: '#4CAF50', // Green circle
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
    animation: 'pulse 1s infinite',
  },
  checkmark: {
    width: '40px',
    height: '20px',
    borderBottom: '5px solid white',
    borderLeft: '5px solid white',
    transform: 'rotate(-45deg)',
  },
  message: {
    color: '#333',
    fontSize: '24px',
    fontWeight: 'bold',
    animation: 'fadeIn 1.5s',
  },
  // Keyframes for animations
  '@keyframes pulse': {
    '0%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.1)' },
    '100%': { transform: 'scale(1)' },
  },
  '@keyframes fadeIn': {
    '0%': { opacity: 0 },
    '100%': { opacity: 1 },
  },
};
