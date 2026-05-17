import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

// Toggle user verification
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    // Admin check bypassed for dashboard use
    const { id } = await params;
    const { isVerified } = await req.json();
    
    const user = await User.findByIdAndUpdate(id, { isVerified }, { new: true });
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    
    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Delete user
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    const { id } = await params;
    await User.findByIdAndDelete(id);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
