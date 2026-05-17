import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ success: false, error: "Email and code are required" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    if (user.verificationCode !== code) {
      return NextResponse.json({ success: false, error: "Invalid verification code" }, { status: 400 });
    }

    if (user.verificationCodeExpiresAt && new Date() > user.verificationCodeExpiresAt) {
      return NextResponse.json({ success: false, error: "Verification code expired" }, { status: 400 });
    }

    // Mark as verified
    user.isPhoneVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpiresAt = undefined;
    await user.save();

    return NextResponse.json({ success: true, message: "Phone verified successfully" });
  } catch (error: any) {
    console.error("SMS verification error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
