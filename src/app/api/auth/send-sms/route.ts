import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import twilio from "twilio";
import { isRateLimited } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    // Rate Limiting Check: 3 requests per 5 minutes
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "127.0.0.1";
    const { limited, remaining, resetTime } = isRateLimited(ip, "send-sms", {
      limit: 3,
      windowMs: 5 * 60 * 1000
    });

    if (limited) {
      return NextResponse.json({ 
        success: false, 
        error: "Too many SMS requests. Please wait 5 minutes before trying again." 
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

    await connectToDatabase();
    const { phone, email } = await req.json();

    if (!phone || !email) {
      return NextResponse.json({ success: false, error: "Phone and email are required" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Generate a 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.phone = phone;
    user.verificationCode = code;
    user.verificationCodeExpiresAt = expiresAt;
    await user.save();

    // Send SMS via Twilio
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken && twilioPhone) {
      const client = twilio(accountSid, authToken);
      await client.messages.create({
        body: `Your Fin Huwa verification code is: ${code}`,
        from: twilioPhone,
        to: phone
      });
    } else {
      // In development/test mode without Twilio keys, just log the code
      console.log(`[TEST MODE] Twilio not configured. Verification code for ${phone} is: ${code}`);
    }

    return NextResponse.json({ success: true, message: "Verification code sent" });
  } catch (error: any) {
    console.error("SMS sending error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
