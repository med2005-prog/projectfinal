import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import { isRateLimited } from "@/lib/rateLimit";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export async function POST(req: Request) {
  try {
    // Spam protection: 3 registrations per 30 minutes per IP
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const { limited, resetTime } = isRateLimited(ip, "register", { limit: 3, windowMs: 30 * 60 * 1000 });
    if (limited) {
      return NextResponse.json(
        { success: false, error: "Too many registration attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": Math.ceil((resetTime - Date.now()) / 1000).toString() } }
      );
    }

    await connectToDatabase();
    const { name, email, password, role } = await req.json();
    
    // 1. Validation
    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    // Validate role
    const validRoles = ["user", "partner"];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ success: false, error: "Invalid role" }, { status: 400 });
    }

    // 2. Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ 
        success: false, 
        error: "This email is already registered. One email can only have one account type." 
      }, { status: 400 });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
      isPremium: role === "partner" // Default premium for partners if needed, or handle separately
    });

    // 5. Create Token
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    // 6. Set Cookie
    const cookie = serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    const response = NextResponse.json({ 
      success: true, 
      data: { 
        _id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        isPremium: user.isPremium 
      } 
    });

    response.headers.set("Set-Cookie", cookie);

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
