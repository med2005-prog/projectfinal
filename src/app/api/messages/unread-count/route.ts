import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Message from "@/models/Message";
import { getUserIdFromSession } from "@/lib/auth";

export async function GET() {
  try {
    await connectToDatabase();
    const userId = await getUserIdFromSession();

    if (!userId) {
      return NextResponse.json({ success: false, data: 0 });
    }

    const count = await Message.countDocuments({ 
      receiver: userId, 
      isRead: false 
    });

    return NextResponse.json({ success: true, data: count });
  } catch (error: any) {
    return NextResponse.json({ success: false, data: 0 });
  }
}
