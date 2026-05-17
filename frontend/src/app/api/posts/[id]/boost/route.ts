import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";

import Post, { BoostPlan } from "@/models/Post";
import User from "@/models/User";

import { getUserIdFromSession } from "@/lib/auth";


import { BOOST_CONFIG, VALID_PLANS } from "@/lib/config/boost";


export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const { boostPlan } = await req.json();

    // Validate plan
    if (!VALID_PLANS.includes(boostPlan)) {
      return NextResponse.json(
        { success: false, error: "Invalid boost plan" },
        { status: 400 }
      );
    }

    const config = BOOST_CONFIG[boostPlan as BoostPlan];

    // Resolve the authenticated user from the session
    const userId = await getUserIdFromSession();


    // Guard: free starter plan requires a logged-in user who hasn't used it
    if (config.isFree) {
      if (!userId) {
        return NextResponse.json(
          { success: false, error: "You must be logged in to use the free boost." },
          { status: 401 }
        );
      }
      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
      }
      if (user.hasUsedFreeBoost) {
        return NextResponse.json(
          { success: false, error: "Free boost already used. Please choose a paid plan." },
          { status: 403 }
        );
      }
    }

    // Fetch post
    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
    }

    // Set boost fields
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + config.durationHours);

    post.boosted = true;
    post.boostPlan = boostPlan;
    post.boostType = boostPlan; // backward compat
    post.boostExpiresAt = expiresAt;
    post.boostRank = config.rank;
    await post.save();

    // Mark free boost used
    if (config.isFree && userId) {
      await User.findByIdAndUpdate(userId, { hasUsedFreeBoost: true });
    }

    // City notifications for Pro & Premium
    if (boostPlan === "pro" || boostPlan === "premium") {
      console.log(
        `📢 [NOTIFY] ${boostPlan.toUpperCase()} — "${post.title}" in ${post.city}. ` +
        `Sending push to users in ${post.city}.`
      );
      // TODO: integrate with a push service (e.g., Firebase, OneSignal)
    }

    return NextResponse.json({
      success: true,
      data: { boostPlan, boostExpiresAt: expiresAt, boostRank: config.rank }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
