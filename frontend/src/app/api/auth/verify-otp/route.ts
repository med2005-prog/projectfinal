import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { getUserIdFromSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { code } = await req.json();
    if (!code) return NextResponse.json({ success: false, error: "OTP code is required" }, { status: 400 });

    await connectToDatabase();
    const user = await User.findById(userId);

    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

    if (user.verificationCode !== code) {
      return NextResponse.json({ success: false, error: "الكود غير صحيح" }, { status: 400 });
    }

    if (new Date() > new Date(user.verificationCodeExpiresAt)) {
      return NextResponse.json({ success: false, error: "انتهت صلاحية الكود" }, { status: 400 });
    }

    user.isPhoneVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpiresAt = undefined;
    await user.save();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
