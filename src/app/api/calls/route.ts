import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Call from "@/models/Call";
import { getUserIdFromSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const { receiverId, type, sdpOffer, callId } = await req.json();

    if (callId) {
      // Update existing call with offer
      const call = await Call.findByIdAndUpdate(callId, { sdpOffer }, { new: true });
      return NextResponse.json({ success: true, data: call });
    }

    // Cancel any previous pending calls for these users
    await Call.updateMany(
      { caller: userId, status: "pending" },
      { status: "ended" }
    );

    const call = await Call.create({
      caller: userId,
      receiver: receiverId,
      type,
      sdpOffer,
      status: "pending"
    });

    return NextResponse.json({ success: true, data: call });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    
    // Check for incoming pending calls
    const call = await Call.findOne({
      receiver: userId,
      status: "pending",
      createdAt: { $gt: new Date(Date.now() - 30000) } // Only calls from last 30s
    })
    .populate("caller", "name avatar")
    .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: call });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
