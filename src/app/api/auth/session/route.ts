import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    
    if (!token) {
      return NextResponse.json({ user: null });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any;
      
      return NextResponse.json({
        user: {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role
        }
      });
    } catch (jwtError) {
      // Token is invalid, clear it
      const response = NextResponse.json({ user: null });
      response.cookies.set("auth-token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0
      });
      return response;
    }
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json({ user: null });
  }
}
