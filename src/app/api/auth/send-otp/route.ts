import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { sendSMS } from "@/lib/twilio";
import { getUserIdFromSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
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
