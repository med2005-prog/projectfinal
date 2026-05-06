import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import { getUserIdFromSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const userId = await getUserIdFromSession();

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await Conversation.find({
      participants: userId
    })
    .populate("participants", "name avatar")
    .populate("item", "title images")
    .sort({ lastMessageAt: -1 });

    return NextResponse.json({ success: true, data: conversations });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("id");
    
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!conversationId) {
      return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });
    }

    // Verify user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return NextResponse.json({ success: false, error: "Conversation not found or unauthorized" }, { status: 404 });
    }

    // Delete messages
    await Message.deleteMany({ conversationId: conversationId });
    
    // Delete conversation
    await Conversation.findByIdAndDelete(conversationId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
