import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { getUserIdFromSession } from "@/lib/auth";

// Heartbeat - update lastSeen
export async function POST() {
  try {
    await connectToDatabase();
    const userId = await getUserIdFromSession();
    if (!userId) return NextResponse.json({ success: false }, { status: 401 });

    await User.findByIdAndUpdate(userId, { lastSeen: new Date() });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
