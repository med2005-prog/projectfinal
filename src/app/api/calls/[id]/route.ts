import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Call from "@/models/Call";
import { getUserIdFromSession } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const { id } = await params;

    const call = await Call.findById(id)
      .populate("caller", "name avatar")
      .populate("receiver", "name avatar");

    if (!call) return NextResponse.json({ success: false, error: "Call not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: call });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
