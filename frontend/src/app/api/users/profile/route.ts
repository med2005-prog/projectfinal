import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { getUserIdFromSession } from "@/lib/auth";

export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const updateData: any = {};
    
    // Allow updating specific fields
    if (body.name) updateData.name = body.name;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.avatar) updateData.avatar = body.avatar;
    if (body.notifications) updateData.notifications = body.notifications;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedUser }, { status: 200 });
  } catch (error: any) {
    console.error("PUT /api/users/profile error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
