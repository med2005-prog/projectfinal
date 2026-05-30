import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Post from "@/models/Post";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json({ success: false, error: "Post ID is required" }, { status: 400 });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
    }

    // Matching Algorithm
    const matchType = post.type === "lost" ? "found" : "lost";
    
    // Create text search string from title and description
    const searchString = `${post.title} ${post.description}`.replace(/[^\w\s]/gi, '');
    
    const matches = await Post.find({
      _id: { $ne: post._id }, // Exclude the current post
      type: matchType,
      city: post.city, // Same city
      category: post.category, // Same category
      $text: { $search: searchString } // Keyword match
    })
    .sort({ score: { $meta: "textScore" } })
    .limit(10)
    .populate("author", "name avatar");

    return NextResponse.json({ success: true, data: matches }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
