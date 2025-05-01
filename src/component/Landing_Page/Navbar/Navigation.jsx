import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { TbMenu2, TbUser } from "react-icons/tb";
import { FiShoppingBag } from "react-icons/fi";
import NavLink from "./Navlink";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function Navigation() {
    const router = useRouter();
    const [menu, setMenu] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Handle scroll effect for navigation
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleProfileClick = async () => {
        try {
            const token = localStorage.getItem("authToken");

            if (!token) {
                router.push("/login");
                return;
            }

            const response = await axios.get(`${apiBaseUrl}/checkLogin`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.isLoggedIn) {
                router.push("/account");
            } else {
                router.push("/login");
            }
        } catch (error) {
            router.push("/login");
        }
    };

    return (
        <div className={`px-[3%] py-[15px] sm:py-[20px] ${scrolled ? 'bg-white/95 backdrop-blur-sm' : 'bg-[#FFFFFF]'} shadow-md sticky top-0 z-50 transition-all duration-300`}>
            <div className="w-full flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center">
                    <Link href={"/"} className="flex z-[500] items-center transition-transform hover:scale-105">
                        <Image
                            width={25}
                            className="h-auto w-[20px] sm:w-[25px] md:w-[30px]"
                            height={25}
                            src="/navbar/LOGO_OUTFIT.svg"
                            alt="logo"
                        />
                        <span className="text-[18px] sm:text-[24px] md:text-[30px] font-[600] ml-[5px] text-gray-800">Outfit Fashions</span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <ul className="hidden md:flex space-x-[20px] pt-[18px] z-[500]">
                    <NavLink className="cursor-pointer font-medium text-gray-700 hover:text-[#024E82] transition-colors duration-200" href={"/"}>
                        HOME
                    </NavLink>
                    <NavLink className="cursor-pointer font-medium text-gray-700 hover:text-[#024E82] transition-colors duration-200" href={"/about"}>
                        ABOUT
                    </NavLink>
                    <NavLink className="cursor-pointer font-medium text-gray-700 hover:text-[#024E82] transition-colors duration-200" href={"/contact"}>
                        CONTACT US
                    </NavLink>
                    <NavLink className="cursor-pointer font-medium text-gray-700 hover:text-[#024E82] transition-colors duration-200" href={"/join"}>
                        JOIN US
                    </NavLink>
                    <NavLink className="cursor-pointer font-medium text-gray-700 hover:text-[#024E82] transition-colors duration-200" href={"/products"}>
                        SHOP NOW
                    </NavLink>
                </ul>

                {/* Mobile Navigation Icons */}
                <div className="flex space-x-[15px] md:space-x-[20px] z-[500] items-center">
                    {/* User Icon */}
                    <div onClick={handleProfileClick} className="transition-transform hover:scale-110 p-2">
                        <TbUser className="text-[18px] sm:text-[22px] cursor-pointer text-gray-700 hover:text-[#024E82]" />
                    </div>

                    {/* Shopping Bag Icon */}
                    <Link href={"/Shoppingbag"} className="relative transition-transform hover:scale-110 p-2">
                        <FiShoppingBag className="text-[18px] sm:text-[22px] cursor-pointer text-gray-700 hover:text-[#024E82]" />
                        
                    </Link>

                    {/* Menu Button (Visible on Mobile) */}
                    <div className="md:hidden p-2">
                        <TbMenu2
                            className="text-[22px] sm:text-[24px] cursor-pointer text-gray-700 hover:text-[#024E82]"
                            onClick={() => setMenu(!menu)}
                        />
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown (Visible on Menu Click) */}
            <div className={`${menu ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'} transition-all duration-300 ease-in-out overflow-hidden md:hidden`}>
                <div className="flex flex-col space-y-[12px] mt-[15px] p-[10px] bg-white rounded-md shadow-md">
                    <NavLink className="cursor-pointer py-[8px] px-[15px] hover:bg-gray-100 rounded-md transition-colors text-gray-700 font-medium" href={"/"}>
                        HOME
                    </NavLink>
                    <NavLink className="cursor-pointer py-[8px] px-[15px] hover:bg-gray-100 rounded-md transition-colors text-gray-700 font-medium" href={"/about"}>
                        ABOUT
                    </NavLink>
                    <NavLink className="cursor-pointer py-[8px] px-[15px] hover:bg-gray-100 rounded-md transition-colors text-gray-700 font-medium" href={"/contact"}>
                        CONTACT US
                    </NavLink>
                    <NavLink className="cursor-pointer py-[8px] px-[15px] hover:bg-gray-100 rounded-md transition-colors text-gray-700 font-medium" href={"/join"}>
                        JOIN US
                    </NavLink>
                    <NavLink className="cursor-pointer py-[8px] px-[15px] hover:bg-gray-100 rounded-md transition-colors text-gray-700 font-medium" href={"/products"}>
                        SHOP NOW
                    </NavLink>
                </div>
            </div>
        </div>
    );
}
