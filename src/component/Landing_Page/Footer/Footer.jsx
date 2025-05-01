import Image from "next/image";
import Link from "next/link";
import { LiaGreaterThanSolid } from "react-icons/lia";
import { FaFacebook, FaTwitter, FaInstagram, FaPinterest } from "react-icons/fa";

const Footer = () => {
    return (
        <div className="bg-gradient-to-r from-gray-50 to-slate-100 px-[5%] py-[40px] sm:py-[60px]">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    <div className="space-y-3">
                        <p className="mb-[15px] sm:mb-[20px] text-[14px] sm:text-[16px] font-bold text-gray-800 uppercase">COMPANY INFO</p>
                        <Link href={"/"} className="block cursor-pointer text-gray-600 hover:text-[#024E82] transition-colors">
                            <p className="text-[13px] sm:text-[14px] py-1">About Us</p>
                        </Link>
                        <Link href={"/"} className="block cursor-pointer text-gray-600 hover:text-[#024E82] transition-colors">
                            <p className="text-[13px] sm:text-[14px] py-1">Latest Posts</p>
                        </Link>
                        <Link href={"/"} className="block cursor-pointer text-gray-600 hover:text-[#024E82] transition-colors">
                            <p className="text-[13px] sm:text-[14px] py-1">Contact Us</p>
                        </Link>
                        <Link href={"/"} className="block cursor-pointer text-gray-600 hover:text-[#024E82] transition-colors">
                            <p className="text-[13px] sm:text-[14px] py-1">Shop</p>
                        </Link>
                    </div>
                    <div className="space-y-3">
                        <p className="mb-[15px] sm:mb-[20px] text-[14px] sm:text-[16px] font-bold text-gray-800 uppercase">HELP LINKS</p>
                        <Link href={"/"} className="block cursor-pointer text-gray-600 hover:text-[#024E82] transition-colors">
                            <p className="text-[13px] sm:text-[14px] py-1">Order Status</p>
                        </Link>
                        <Link href={"/"} className="block cursor-pointer text-gray-600 hover:text-[#024E82] transition-colors">
                            <p className="text-[13px] sm:text-[14px] py-1">Delivery</p>
                        </Link>
                        <Link href={"/"} className="block cursor-pointer text-gray-600 hover:text-[#024E82] transition-colors">
                            <p className="text-[13px] sm:text-[14px] py-1">Shipping Info</p>
                        </Link>
                        <Link href={"/"} className="block cursor-pointer text-gray-600 hover:text-[#024E82] transition-colors">
                            <p className="text-[13px] sm:text-[14px] py-1">FAQ</p>
                        </Link>
                    </div>
                    <div className="space-y-3">
                        <p className="mb-[15px] sm:mb-[20px] text-[14px] sm:text-[16px] font-bold text-gray-800 uppercase">USEFUL LINKS</p>
                        <Link href={"/"} className="block cursor-pointer text-gray-600 hover:text-[#024E82] transition-colors">
                            <p className="text-[13px] sm:text-[14px] py-1">Special Offers</p>
                        </Link>
                        <Link href={"/"} className="block cursor-pointer text-gray-600 hover:text-[#024E82] transition-colors">
                            <p className="text-[13px] sm:text-[14px] py-1">Gift Cards</p>
                        </Link>
                        <Link href={"/"} className="block cursor-pointer text-gray-600 hover:text-[#024E82] transition-colors">
                            <p className="text-[13px] sm:text-[14px] py-1">Advertising</p>
                        </Link>
                        <Link href={"/"} className="block cursor-pointer text-gray-600 hover:text-[#024E82] transition-colors">
                            <p className="text-[13px] sm:text-[14px] py-1">Terms of Use</p>
                        </Link>
                    </div>
                    <div className="space-y-3">
                        <p className="mb-[15px] sm:mb-[20px] text-[14px] sm:text-[16px] font-bold text-gray-800 uppercase">GET IN THE KNOW</p>
                        <div className="flex items-center group">
                            <div className="flex-grow">
                                <input 
                                    className="outline-none w-full bg-transparent text-[13px] sm:text-[14px] text-gray-700 placeholder-gray-500" 
                                    type="text" 
                                    placeholder="Enter email" 
                                />
                                <div className="border-b-2 border-gray-400 group-hover:border-[#024E82] transition-colors"></div>
                            </div>
                            <button className="text-gray-600 group-hover:text-[#024E82] transition-colors ml-2">
                                <LiaGreaterThanSolid className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-[12px] text-gray-500 mt-3">Subscribe to our newsletter for exclusive updates and offers</p>
                    </div>
                </div>

                <div className="mt-10 pt-8 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-6"> 
                        <div className="text-center sm:text-left">
                            <p className="text-[12px] sm:text-[14px] text-gray-600">© 2024 Outfit Fashions</p>
                            <div className="flex space-x-[10px] mt-2 justify-center sm:justify-start">
                                <Link href={"/"} className="text-[12px] sm:text-[14px] cursor-pointer text-gray-600 hover:text-[#024E82] transition-colors">Privacy Policy</Link>
                                <Link href={"/"} className="text-[12px] sm:text-[14px] cursor-pointer text-gray-600 hover:text-[#024E82] transition-colors">Terms & Conditions</Link>
                            </div>
                        </div>
                        <div className="flex items-center space-x-5">
                            <Link href="/" className="text-gray-500 hover:text-[#024E82] transition-colors">
                                <FaFacebook className="w-6 h-6" />
                            </Link>
                            <Link href="/" className="text-gray-500 hover:text-[#024E82] transition-colors">
                                <FaTwitter className="w-6 h-6" />
                            </Link>
                            <Link href="/" className="text-gray-500 hover:text-[#024E82] transition-colors">
                                <FaInstagram className="w-6 h-6" />
                            </Link>
                            <Link href="/" className="text-gray-500 hover:text-[#024E82] transition-colors">
                                <FaPinterest className="w-6 h-6" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Footer;