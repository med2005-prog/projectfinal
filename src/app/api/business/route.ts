import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Business from "@/models/Business";

// Submit a new business registration
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const business = await Business.create(body);
    return NextResponse.json({ success: true, data: business });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Get all business registrations (admin only)
export async function GET() {
  try {
    await connectToDatabase();
    const businesses = await Business.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: businesses });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
