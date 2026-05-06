import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Message from "@/models/Message";
import { getUserIdFromSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { conversationId } = await req.json();
    const userId = await getUserIdFromSession();

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Mark all messages in this conversation where the user is the receiver as read
    await Message.updateMany(
      { conversationId: conversationId, receiver: userId, isRead: false },
      { isRead: true }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
