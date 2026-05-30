import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Business from "@/models/Business";
import User from "@/models/User";
import { getUserIdFromSession } from "@/lib/auth";

// Submit a new business registration
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    
    // Try to get userId from session first
    let userId = await getUserIdFromSession();
    
    // If no session, try to find user by email
    if (!userId && body.email) {
      const existingUser = await User.findOne({ email: body.email });
      if (existingUser) {
        userId = existingUser._id.toString();
      }
    }
    
    // If still no userId, we can't link - but still allow registration
    // The admin will link it when approving via email match
    const business = await Business.create({ 
      ...body, 
      ...(userId ? { userId } : {})
    });
    
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
