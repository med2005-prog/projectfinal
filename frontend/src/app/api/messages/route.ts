import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import { getUserIdFromSession } from "@/lib/auth";
import { sendPushNotification } from "@/lib/push";

export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const { conversationId, receiverId, postId, content, type, audioUrl, transcription } = await req.json();

    // Create message
    const message = await Message.create({
      conversationId,
      post: postId,
      sender: userId,
      receiver: receiverId,
      content,
      type,
      audioUrl,
      transcription
    });

    // Update conversation last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: type === "text" ? content : "Voice message 🎙️",
      lastMessageAt: new Date()
    });

    // Send Push Notification to receiver
    sendPushNotification(receiverId, {
      title: "New Message ✉️",
      body: type === "text" ? content : "You received a voice message 🎙️",
      data: { url: "/messages" }
    });

    return NextResponse.json({ success: true, data: message });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
