import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Post from "@/models/Post";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    // Fetch and increment views
    const post = await Post.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate("author", "name avatar isVerified");

    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
    }

    // Check if boost target is reached and deactivate if so
    if (post.boosted && post.targetViews && post.views >= post.targetViews) {
      post.boosted = false;
      post.boostRank = 0;
      await post.save();
    }

    return NextResponse.json({ success: true, data: post });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Admin/Owner delete
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    await Post.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// User edit (PATCH)
// Keeping original logic for users but allowing bypass if needed? 
// For now, let's just make DELETE work for the admin.
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Keep PATCH simple for now
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();
    const updatedPost = await Post.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json({ success: true, data: updatedPost });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
