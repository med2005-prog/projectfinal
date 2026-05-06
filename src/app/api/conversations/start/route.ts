import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import { getUserIdFromSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const { receiverId, postId } = await req.json();

    // Check if conversation already exists for this post between these users
    let conversation = await Conversation.findOne({
      item: postId,
      participants: { $all: [userId, receiverId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, receiverId],
        item: postId,
        lastMessage: "Conversation started",
        lastMessageAt: new Date()
      });
    }

    return NextResponse.json({ success: true, data: conversation });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
