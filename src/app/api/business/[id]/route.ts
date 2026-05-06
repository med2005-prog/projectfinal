import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Business from "@/models/Business";
import User from "@/models/User";
import { getUserIdFromSession } from "@/lib/auth";

// Update status (approve/reject)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();

    // Admin check
    const currentUser = await User.findById(userId);
    const isOwner = currentUser?.email === "med2005@gmail.com";
    if (!currentUser || (!currentUser.isAdmin && !isOwner)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const { status } = await req.json();
    
    const business = await Business.findByIdAndUpdate(id, { status }, { new: true });
    
    if (status === "approved" && business?.userId) {
      await User.findByIdAndUpdate(business.userId, {
        role: "partner",
        isVerified: true
      });
    }

    return NextResponse.json({ success: true, data: business });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Delete a business
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();

    // Admin check
    const currentUser = await User.findById(userId);
    const isOwner = currentUser?.email === "med2005@gmail.com";
    if (!currentUser || (!currentUser.isAdmin && !isOwner)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    await Business.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
