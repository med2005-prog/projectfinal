import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { email } = await req.json();

    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration attacks
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // Save token to user
    await User.findByIdAndUpdate(user._id, {
      resetToken,
      resetTokenExpiry: resetExpiry
    });

    // In a real app, you would send an email here using Nodemailer, Resend, etc.
    // For example: await sendEmail({ to: email, subject: "Reset Password", body: `...${resetToken}...` })
    console.log(`[DEV] Password reset link: ${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
