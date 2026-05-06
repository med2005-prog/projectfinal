import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Call from "@/models/Call";
import { getUserIdFromSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const { callId, status, sdpAnswer } = await req.json();

    const updateData: any = { status };
    if (sdpAnswer) updateData.sdpAnswer = sdpAnswer;

    const call = await Call.findOneAndUpdate(
      { _id: callId, receiver: userId },
      updateData,
      { new: true }
    );

    if (!call) return NextResponse.json({ success: false, error: "Call not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: call });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
