/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      domains: [
        '127.0.0.1', 
        'localhost',
        'outfits-app-images-123.s3.ap-south-1.amazonaws.com',
        'outfits-backend.amazonaws.com'  // Add your EC2 domain if needed
      ],
    },
  };
  
  module.exports = nextConfig;
  