import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Post from "@/models/Post";
import { getUserIdFromSession } from "@/lib/auth";

// Helper: verify caller is admin
async function verifyAdmin() {
  const userId = await getUserIdFromSession();
  if (!userId) return false;
  const u = await User.findById(userId).select("isAdmin email");
  return u?.isAdmin || u?.email === "med2005@gmail.com" || process.env.NODE_ENV === "development";
}

// Toggle user verification
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    if (!await verifyAdmin()) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    const { isVerified } = await req.json();
    
    const user = await User.findByIdAndUpdate(id, { isVerified }, { new: true });
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    
    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Delete user and their posts
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    if (!await verifyAdmin()) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    
    // Delete all posts by this user first
    await Post.deleteMany({ author: id });
    
    // Then delete the user
    const user = await User.findByIdAndDelete(id);
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
