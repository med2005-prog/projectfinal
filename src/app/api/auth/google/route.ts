import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET || "production_secret_key_change_me_later_123";
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export async function POST(req: Request) {
  try {
    const { access_token } = await req.json();

    if (!access_token) {
      return NextResponse.json({ success: false, error: "No access_token provided" }, { status: 400 });
    }

    // Fetch user info using the access_token
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userInfoRes.ok) {
      return NextResponse.json({ success: false, error: "Failed to fetch user info from Google" }, { status: 400 });
    }

    const payload = await userInfoRes.json();
    
    if (!payload || !payload.email) {
      return NextResponse.json({ success: false, error: "Invalid Google user info" }, { status: 400 });
    }

    await connectToDatabase();

    // Check if user already exists
    let user = await User.findOne({ email: payload.email });

    if (!user) {
      // Create new user if they don't exist
      user = await User.create({
        name: payload.name || "Google User",
        email: payload.email,
        password: Math.random().toString(36).slice(-10) + "A1!", // Random password, they won't use it
        avatar: payload.picture || "",
        isVerified: payload.email_verified || false,
      });
    }

    // Generate our JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    // Set cookie
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
        avatar: user.avatar,
        role: user.role,
        isPremium: user.isPremium,
      },
    });

    response.headers.set("Set-Cookie", cookie);

    return response;
  } catch (error: any) {
    console.error("Google Auth Error:", error);
    return NextResponse.json({ success: false, error: "Authentication failed. " + error.message }, { status: 500 });
  }
}
