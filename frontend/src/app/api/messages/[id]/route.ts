import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Message from "@/models/Message";

import { getUserIdFromSession } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const { id: conversationId } = await params;


    const messages = await Message.find({
      conversationId
    }).sort({ createdAt: 1 });

    return NextResponse.json({ success: true, data: messages });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
