"use client";

import Image from "next/image";
import { useState } from "react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function Contact() {
    const [name, setName] = useState("");
    const [subject, setSubject] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate fields
        if (!name || !email || !message) {
            setStatus("All fields are required.");
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setStatus("Please enter a valid email address.");
            return;
        }

        // Prepare data
        const payload = {
            user_email: email,
            user_id: name,
            subject: subject || "No Subject",
            body: message,
        };

        setLoading(true);
        setStatus("");

        try {
            // Send POST request
            const response = await fetch(`${apiBaseUrl}/send-email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Failed to send the message.");
            }

            setStatus("Message sent successfully!");
            setName("");
            setSubject("");
            setEmail("");
            setMessage("");
        } catch (error) {
            setStatus("Error sending message: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Hero Section */}
            <div className="bg-[url('/contact/Contact.svg')] w-full bg-cover h-[40vh] sm:h-[50vh] md:h-[60vh] bg-no-repeat flex justify-center items-end"></div>
    
            {/* Introduction Section */}
            <div className="flex flex-col justify-center mt-[50px] sm:mt-[80px] px-[5%] text-center">
                <p className="text-[20px] sm:text-[24px] font-[400]">We would love to hear from you.</p>
                <p className="text-[16px] sm:text-[18px] text-[#555] mt-[10px]">
                    If you have any query or suggestion, you can contact us here. We look forward to hearing from you.
                </p>
            </div>
    
            {/* Main Content */}
            <div className="flex flex-col lg:flex-row items-start justify-between mt-[30px] sm:mt-[40px] px-[5%] space-y-[20px] lg:space-y-0 lg:space-x-[20px]">
                {/* Contact Form */}
                <form
                    className="w-full lg:w-2/3 max-w-md sm:max-w-lg lg:max-w-none pb-[40px]"
                    onSubmit={handleSubmit}
                >
                    <input
                        type="text"
                        placeholder="Name or UserID"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-[8px] sm:p-[10px] my-[10px] text-[14px] sm:text-[16px] border border-gray-300 rounded-[5px]"
                        aria-label="Name"
                    />
                    <input
                        type="text"
                        placeholder="Subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full p-[8px] sm:p-[10px] my-[10px] text-[14px] sm:text-[16px] border border-gray-300 rounded-[5px]"
                        aria-label="Subject"
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-[8px] sm:p-[10px] my-[10px] text-[14px] sm:text-[16px] border border-gray-300 rounded-[5px]"
                        aria-label="Email"
                    />
                    <textarea
                        placeholder="Message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full p-[8px] sm:p-[10px] my-[10px] h-[80px] sm:h-[100px] text-[14px] sm:text-[16px] border border-gray-300 rounded-[5px] resize-none"
                        aria-label="Message"
                    ></textarea>
                    <button
                        type="submit"
                        className={`w-full bg-[#333] text-[#fff] p-[8px] sm:p-[10px] text-[14px] sm:text-[16px] font-[700] rounded-[5px] mt-[10px] ${
                            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#555]"
                        }`}
                        disabled={loading}
                    >
                        {loading ? "SENDING..." : "SEND MESSAGE"}
                    </button>
                </form>
    
                {status && (
                    <div className="mt-[10px] text-[14px] sm:text-[16px] text-center text-[#555]">{status}</div>
                )}
    
                {/* Contact Information */}
                <div className="w-full lg:w-1/3 flex flex-col space-y-[20px] sm:space-y-[30px] text-left">
                    <div>
                        <p className="text-[20px] sm:text-[24px] font-[700] mb-[10px]">Visit Us</p>
                        <p className="text-[14px] sm:text-[16px] text-[#555]">OUTFIT FASHIONS, COIMBATORE.</p>
                    </div>
                    <div>
                        <p className="text-[20px] sm:text-[24px] font-[700] mb-[10px]">Get In Touch</p>
                        <p className="text-[14px] sm:text-[16px] text-[#555]">You can get in touch with us through this email:</p>
                        <p className="text-[14px] sm:text-[16px] text-[#555] font-semibold">
                            sales.outfitfashions@gmail.com
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
    
}
