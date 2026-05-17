import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Business from "@/models/Business";
import User from "@/models/User";
import { getUserIdFromSession } from "@/lib/auth";

export async function GET() {
  try {
    await connectToDatabase();
    const userId = await getUserIdFromSession();
    
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

    const business = await Business.findOne({ 
      $or: [
        { userId },
        { email: user.email }
      ]
    });

    // Auto-link userId if it's missing but we found the business by email
    if (business && !business.userId) {
      business.userId = user._id;
      await business.save();
    }

    return NextResponse.json({ 
      success: true, 
      hasBusiness: !!business,
      status: business ? business.status : "none",
      data: business
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
