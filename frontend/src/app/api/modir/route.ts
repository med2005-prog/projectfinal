import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Post from "@/models/Post";
import User from "@/models/User";
import { getUserIdFromSession } from "@/lib/auth";

export async function GET() {
  try {
    await connectToDatabase();
    
    // Attempt to get user from session
    const userId = await getUserIdFromSession();
    let isAuthorized = false;

    if (userId) {
      const currentUser = await User.findById(userId);
      if (currentUser && (currentUser.isAdmin || currentUser.email === "med2005@gmail.com")) {
        isAuthorized = true;
      }
    }

    // For the "Modir" special page, we'll allow access if we can verify it's the owner
    // In a real prod app, you'd use a better session, but for this request:
    if (!isAuthorized && process.env.NODE_ENV === "development") {
      isAuthorized = true; // Allow in dev for the user to see "real data"
    }

    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const posts = await Post.find().populate("author", "name email phone").sort({ createdAt: -1 });
    const users = await User.find().sort({ createdAt: -1 });

    return NextResponse.json({ 
      success: true, 
      data: { posts, users } 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
