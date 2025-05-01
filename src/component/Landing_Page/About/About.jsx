import Image from "next/image";
import Link from "next/link";

export default function About() {
    return (
        <>
            {/* Hero Section */}
            <div className="bg-[url('/about/unsplash_7RIMS-NMsbc.svg')] w-full bg-cover bg-center h-[40vh] sm:h-[50vh] md:h-[60vh] bg-no-repeat flex justify-start items-end">
                <div className="flex flex-col justify-start items-start w-full px-4 md:px-[20px]">
                    <p className="text-[#ffff] text-[24px] sm:text-[30px] md:text-[50px] py-[30px] sm:py-[40px] md:py-[80px] font-[400] text-start">
                        ABOUT OUTFIT FASHIONS
                    </p>
                </div>
            </div>

            {/* Two-Image Section */}
            <div className="flex flex-col justify-center mt-[30px] sm:mt-[50px] md:mt-[100px] px-4 md:px-[5%]">
                <div className="flex flex-col md:flex-row md:space-x-[60px] space-y-[20px] md:space-y-0">
                    <div className="bg-[url('/about/unsplash_W7b3eDUb_2I.svg')] w-full bg-cover bg-center h-[40vh] sm:h-[50vh] md:h-[90vh] bg-no-repeat flex justify-center items-end">
                        <div className="px-4 md:px-[20px]">
                            <Link href="/products?gender=Female">
                                <p className="bg-[#ffff] text-[16px] sm:text-[18px] md:text-[25px] text-[#024E82] mb-[20px] md:mb-[40px] px-[15px] sm:px-[20px] md:px-[28px] py-[8px] sm:py-[10px] md:py-[15px] rounded-[15px] font-[400]">
                                    BUY NOW
                                </p>
                            </Link>
                        </div>
                    </div>
                    <div className="bg-[url('/about/unsplash_a3RhaDG_pNM.svg')] w-full bg-cover bg-center h-[40vh] sm:h-[50vh] md:h-[90vh] bg-no-repeat flex justify-center items-end">
                        <div className="px-4 md:px-[20px]">
                            <Link href="/products?gender=Male">
                                <p className="bg-[#ffff] text-[16px] sm:text-[18px] md:text-[25px] text-[#024E82] mb-[20px] md:mb-[40px] px-[15px] sm:px-[20px] md:px-[28px] py-[8px] sm:py-[10px] md:py-[15px] rounded-[15px] font-[400]">
                                    BUY NOW
                                </p>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Section */}
            <div className="flex flex-col justify-center text-center py-[20px] md:py-[40px]">
                <p className="text-[22px] sm:text-[24px] md:text-[40px] font-[700]">OUR</p>
                <p className="text-[22px] sm:text-[24px] md:text-[40px] font-[700]">PRODUCTS</p>
            </div>
            <div className="flex flex-col px-4 md:px-[5%]">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[15px] sm:gap-[20px] md:gap-[50px]">
                    <div>
                        <Link href="/products?category=Boys%2CGirls">
                            <Image src={"/about/Rectangle 8.svg"} height={400} width={400} className="w-full h-auto" alt="kids-clothing" />
                        </Link>
                        <div className="flex flex-col mt-[10px] justify-start text-start">
                            <p className="font-[700] text-[14px] sm:text-[16px] md:text-[18px]">Kid Clothing</p>
                        </div>
                    </div>
                    <div>
                        <Link href="/products?gender=Female">
                            <Image src={"/about/Rectangle 8 (1).svg"} height={400} width={400} className="w-full h-auto" alt="women-clothing" />
                        </Link>
                        <div className="flex flex-col mt-[10px] justify-start text-start">
                            <p className="font-[700] text-[14px] sm:text-[16px] md:text-[18px]">Womens Clothing</p>
                        </div>
                    </div>
                    <div >
                        <Link href="/products?gender=Male">
                            <Image src={"/about/Rectangle 8 (2).svg"} height={400} width={400} className="w-full h-auto" alt="men-clothing" />
                        </Link>
                        <div className="flex flex-col mt-[10px] justify-start text-start">
                            <p className="font-[700] text-[14px] sm:text-[16px] md:text-[18px]">Mens Clothing</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Testimonials Section */}
            <div className="flex flex-col justify-center text-center py-[30px] sm:py-[40px] md:py-[70px]">
                <p className="text-[22px] sm:text-[24px] md:text-[40px] font-[700]">Testimonials</p>
            </div>
            <div className="flex flex-col gap-[30px] sm:gap-[40px] md:gap-[60px] px-4 sm:px-[10%] md:px-[20%]">
                {/* Testimonial 1 */}
                <div className="flex flex-col md:flex-row md:space-x-[40px] items-center text-center md:text-left">
                    <Image src={"/about/unsplash_6W4F62sN_yI.svg"} height={300} width={300} className="h-auto w-[200px] sm:w-[250px] md:w-[300px] mb-4 md:mb-0" alt="stacy" />
                    <div className="flex flex-col justify-center items-center md:items-start gap-[15px] sm:gap-[20px] md:gap-[30px]">
                        <Image src={"/about/page 1.svg"} height={40} width={40} className="h-auto w-[30px] sm:w-[35px] md:w-[40px]" alt="icon" />
                        <p className="text-[13px] sm:text-[14px] md:text-[16px] font-[700]">
                            Once we ordered some accessories items and we got the products delivered to our doorstep. The customer support was super helpful and they answered all my queries.
                        </p>
                        <p className="text-[13px] sm:text-[14px] md:text-[16px] font-[400]">Stacy</p>
                    </div>
                </div>
                {/* Testimonial 2 */}
                <div className="flex flex-col md:flex-row md:space-x-[40px] items-center text-center md:text-left">
                    <Image src={"/about/unsplash_6W4F62sN_yI (1).svg"} height={230} width={230} className="h-auto w-[180px] sm:w-[200px] md:w-[230px] mb-4 md:mb-0" alt="tiffany" />
                    <div className="flex flex-col justify-center items-center md:items-start gap-[15px] sm:gap-[20px] md:gap-[30px]">
                        <Image src={"/about/page 1.svg"} height={40} width={40} className="h-auto w-[30px] sm:w-[35px] md:w-[40px]" alt="icon" />
                        <p className="text-[13px] sm:text-[14px] md:text-[16px] font-[700]">
                            I ordered 5 shirts from them and received them in no time. The customer support was awesome!
                        </p>
                        <p className="text-[13px] sm:text-[14px] md:text-[16px] font-[400]">Tiffany</p>
                    </div>
                </div>
                {/* Testimonial 3 */}
                <div className="flex flex-col md:flex-row md:space-x-[40px] items-center text-center md:text-left">
                    <Image src={"/about/unsplash_6W4F62sN_yI (2).svg"} height={300} width={300} className="h-auto w-[200px] sm:w-[250px] md:w-[300px] mb-4 md:mb-0" alt="james" />
                    <div className="flex flex-col justify-center items-center md:items-start gap-[15px] sm:gap-[20px] md:gap-[30px]">
                        <Image src={"/about/page 1.svg"} height={40} width={40} className="h-auto w-[30px] sm:w-[35px] md:w-[40px]" alt="icon" />
                        <p className="text-[13px] sm:text-[14px] md:text-[16px] font-[700]">
                            I got a wrong shirt so I contacted them and they happily offered me a refund. I will surely shop from them again.
                        </p>
                        <p className="text-[13px] sm:text-[14px] md:text-[16px] font-[400]">James</p>
                    </div>
                </div>
            </div>
        </>
    );
}












