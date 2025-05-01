import { NextResponse } from "next/server";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(request) {


  const payload = await request.json();
  
  let params;
  

  params = {
    Email: payload.email,
    Username: payload.username,
    Password: payload.password,
  };

 console.log(payload)
 try {
    const res = await fetch(`${apiBaseUrl}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });
   
  
      if (!res.ok) {
      throw new Error(`API request failed with status ${res.status}`);
    }  
    const data = await res.json();
 
    return NextResponse.json(data);
  
  } catch (error) {
  
    return NextResponse.json(
      { message: "An error occurred during the request" },
      { status: 500 }
    );
  } 
}
