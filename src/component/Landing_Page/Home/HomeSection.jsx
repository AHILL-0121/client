'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function HomeSection() {
    const [productList, setProductList] = useState([]);
    const [weeklyPicks, setWeeklyPicks] = useState([]);
    const [topSellers, setTopSellers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch the products from the API
        axios.get(`${apiBaseUrl}/productsdisplay`)
            .then((response) => {
                const products = response.data;
    
                // Categorize products into sections
                setProductList(products.slice(0, 4)); // First 4 products for "New Arrivals"
                setWeeklyPicks(products.slice(4, 8));  // Next 4 for "Weekly Picks"
                setTopSellers(products.slice(8, 12)); // Next 4 for "Top Sellers"
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching products:", error);
                setLoading(false);
            });
    }, []);
    
    // Animation variants
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.6 }
        }
    };

    // Product card component for reusability
    const ProductCard = ({ product, delay = 0 }) => (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ delay: delay * 0.1 }}
            className="group"
        >
            <Link href={`/products/${product.product_id}`}>
                <div className="flex flex-col items-center overflow-hidden">
                    <div className="overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-all duration-300 w-full">
                        <div className="relative">
                            <img
                                src={product.product_image.split(',')[0].replace(/\.svg$/, ".jpeg")}
                                alt={product.product_name}
                                className="h-[250px] sm:h-[300px] md:h-[350px] w-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                        </div>
                    </div>
                    <div className="flex flex-col mt-[10px] sm:mt-[15px] justify-center text-center w-full px-2">
                        <h3 className="font-bold text-[14px] sm:text-[16px] text-gray-800 line-clamp-1 group-hover:text-[#024E82] transition-colors duration-300">{product.product_name}</h3>
                        <div className="flex justify-center items-center gap-2 mt-1">
                            <p className="text-[#024E82] text-[14px] sm:text-[16px] font-semibold">
                                {"₹" + product.final_price.toString()}
                            </p>
                            {product.original_price > product.final_price && (
                                <p className="text-gray-500 text-[12px] sm:text-[14px] line-through">
                                    {"₹" + product.original_price.toString()}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#024E82]"></div>
            </div>
        );
    }

    return (
        <>
            {/* Hero Section */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="bg-[url('/hero/img_1.svg')] w-full bg-no-repeat bg-cover bg-center align-middle h-[60vh] sm:h-[75vh] md:h-[90vh]"
            >
                <div className="h-full flex flex-col justify-end w-full items-center sm:items-end pb-12 sm:pb-16 md:pb-20">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="px-[20px] text-center sm:text-right sm:mr-10 md:mr-16 backdrop-blur-sm bg-black/10 p-6 rounded-lg"
                    >
                        <h1 className="text-white text-[32px] sm:text-[45px] md:text-[55px] font-bold leading-tight">
                            STYLIST PICKS BEAT <br className="hidden sm:block" />
                            <span className="mt-[-8px] sm:mt-[-12px] inline-block">THE HEAT</span>
                        </h1>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.6 }}
                            className="mt-8"
                        >
                            <Link
                                className="inline-block text-white text-[16px] sm:text-[18px] md:text-[20px] font-bold py-[10px] sm:py-[12px] px-[24px] sm:px-[28px] border-2 border-white hover:bg-white hover:text-[#024E82] transition-all duration-300 rounded"
                                href={"/products"}
                            >
                                SHOP NOW
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Discover New Arrivals Section */}
            <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeIn}
                className="flex flex-col justify-center text-center py-[40px] sm:py-[60px] max-w-7xl mx-auto"
            >
                <h2 className="text-[30px] sm:text-[38px] md:text-[44px] font-bold text-gray-800">Discover NEW Arrivals</h2>
                <p className="text-[18px] sm:text-[20px] md:text-[22px] text-gray-500 mt-2">Recently added Products!</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-[15px] sm:gap-[20px] md:gap-[30px] px-[3%] sm:px-[5%] mt-[30px] sm:mt-[40px]">
                    {productList.map((product, index) => (
                        <ProductCard key={product.product_id} product={product} delay={index} />
                    ))}
                </div>
            </motion.div>

            {/* Weekly Picks Section */}
            <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeIn}
                className="flex flex-col justify-center text-center py-[40px] sm:py-[60px] bg-gray-50"
            >
                <div className="max-w-7xl mx-auto px-[3%] sm:px-[5%]">
                    <h2 className="text-[30px] sm:text-[38px] md:text-[44px] font-bold text-gray-800">Weekly Picks</h2>
                    <p className="text-[18px] sm:text-[20px] md:text-[22px] text-gray-500 mt-2">Curated styles you'll love</p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-[15px] sm:gap-[20px] md:gap-[30px] mt-[30px] sm:mt-[40px]">
                        {weeklyPicks.map((product, index) => (
                            <ProductCard key={product.product_id} product={product} delay={index} />
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Top Sellers Section */}
            <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeIn}
                className="flex flex-col justify-center text-center py-[40px] sm:py-[60px] max-w-7xl mx-auto"
            >
                <h2 className="text-[30px] sm:text-[38px] md:text-[44px] font-bold text-gray-800">Top Sellers</h2>
                <p className="text-[18px] sm:text-[20px] md:text-[22px] text-gray-500 mt-2">Browse our top-selling products</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-[15px] sm:gap-[20px] md:gap-[30px] px-[3%] sm:px-[5%] mt-[30px] sm:mt-[40px]">
                    {topSellers.map((product, index) => (
                        <ProductCard key={product.product_id} product={product} delay={index} />
                    ))}
                </div>
            </motion.div>

            {/* Bottom Button */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="flex justify-center my-[40px] sm:my-[60px] text-center"
            >
                <Link
                    href={"/products"}
                    className="inline-block text-[16px] sm:text-[18px] bg-[#024E82] font-bold py-[12px] sm:py-[15px] px-[25px] sm:px-[32px] rounded-lg cursor-pointer text-white hover:bg-[#023e68] transition-colors duration-300 shadow-md hover:shadow-lg"
                >
                    EXPLORE ALL PRODUCTS
                </Link>
            </motion.div>
        </>
    );
}
