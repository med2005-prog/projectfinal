import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Call from "@/models/Call";
import { getUserIdFromSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const { callId, candidate, role } = await req.json();

    const field = role === "caller" ? "callerIceCandidates" : "receiverIceCandidates";

    await Call.findByIdAndUpdate(callId, {
      $push: { [field]: JSON.stringify(candidate) }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
