import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { sendSMS } from "@/lib/twilio";
import { getUserIdFromSession } from "@/lib/auth";
import { isRateLimited } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    // Rate Limiting Check: 3 requests per 5 minutes
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "127.0.0.1";
    const { limited, remaining, resetTime } = isRateLimited(ip, "send-otp", {
      limit: 3,
      windowMs: 5 * 60 * 1000
    });

    if (limited) {
      return NextResponse.json({ 
        success: false, 
        error: "Too many OTP requests. Please wait 5 minutes before trying again." 
      }, { 
        status: 429,
        headers: {
          "Retry-After": Math.ceil((resetTime - Date.now()) / 1000).toString(),
          "X-RateLimit-Limit": "3",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": resetTime.toString()
        }
      });
    }

    const userId = await getUserIdFromSession();
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const user = await User.findById(userId);
    if (!user || !user.phone) {
      return NextResponse.json({ success: false, error: "Phone number not found" }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    user.verificationCode = otp;
    user.verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await user.save();

    const message = `Fin Huwa: كود التفعيل الخاص بك هو: ${otp}. صالح لمدة 10 دقائق.`;
    const result = await sendSMS(user.phone, message);

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
