import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { token, password } = await req.json();

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() } // Token must not be expired
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid or expired reset link." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
