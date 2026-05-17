import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Post from "@/models/Post";
import { getUserIdFromSession } from "@/lib/auth";

export async function GET() {
  try {
    await connectToDatabase();
    const userId = await getUserIdFromSession();
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const user = await User.findById(userId).populate({
      path: "favorites",
      populate: { path: "author", select: "name avatar" }
    });

    return NextResponse.json({ success: true, data: user.favorites });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const userId = await getUserIdFromSession();
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { postId } = await req.json();
    const user = await User.findById(userId);

    const index = user.favorites.indexOf(postId);
    if (index > -1) {
      user.favorites.splice(index, 1);
    } else {
      user.favorites.push(postId);
    }

    await user.save();
    return NextResponse.json({ success: true, isFavorite: index === -1 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
