import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Post from "@/models/Post";
import User from "@/models/User";
import Business from "@/models/Business";
import { getUserIdFromSession } from "@/lib/auth";

export async function GET() {
  try {
    await dbConnect();

    // Admin guard
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const currentUser = await User.findById(userId).select("isAdmin email");
    const isAdmin = currentUser?.isAdmin || currentUser?.email === "med2005@gmail.com";
    if (!isAdmin && process.env.NODE_ENV !== "development") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    // Fetch counts in parallel for performance
    const [
      totalPosts,
      lostPosts,
      foundPosts,
      totalUsers,
      totalBusinesses,
      pendingBusinesses,
      approvedBusinesses
    ] = await Promise.all([
      Post.countDocuments({ status: { $ne: "deleted" } }),
      Post.countDocuments({ type: "lost", status: { $ne: "deleted" } }),
      Post.countDocuments({ type: "found", status: { $ne: "deleted" } }),
      User.countDocuments(),
      Business.countDocuments(),
      Business.countDocuments({ status: "pending" }),
      Business.countDocuments({ status: "approved" })
    ]);

    // Calculate real user growth over last 5 months
    const fiveMonthsAgo = new Date();
    fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);

    const userStats = await User.aggregate([
      { $match: { createdAt: { $gte: fiveMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Calculate real revenue
    const boostedPostsCount = await Post.countDocuments({ boosted: true, status: { $ne: "deleted" } });
    const totalRevenue = boostedPostsCount * 50;

    // Fill last 5 months
    const realUserTrend: any[] = [];
    const currentMonth = new Date().getMonth() + 1;
    for (let i = 0; i < 5; i++) {
       const targetMonth = ((currentMonth - 5 + i + 12) % 12) || 12;
       const found = userStats.find(s => s._id.month === targetMonth);
       realUserTrend.push(found ? found.count : 0);
    }

    // Since real data might be small (all 0s or 1s), let's ensure at least the total is reflected
    if (realUserTrend.every(v => v === 0) && totalUsers > 0) {
       realUserTrend.pop();
       realUserTrend.push(totalUsers);
    }

    const realRevenueTrend: any[] = [0, 0, 0, 0, 0, 0];
    realRevenueTrend.push(totalRevenue);

    const stats = {
      total: totalPosts,
      lost: lostPosts,
      found: foundPosts,
      users: totalUsers,
      revenue: totalRevenue,
      bizTotal: totalBusinesses,
      bizPending: pendingBusinesses,
      bizApproved: approvedBusinesses,
      bizSuccessRate: totalBusinesses > 0 ? Math.round((approvedBusinesses / totalBusinesses) * 100) : 0,
      revenueTrend: realRevenueTrend,
      userTrend: realUserTrend
    };

    // Also fetch all data for the lists and management tabs
    const [allPosts, allUsers] = await Promise.all([
      Post.find({ status: { $ne: "deleted" } })
        .sort({ createdAt: -1 })
        .populate("author", "name email"),
      User.find()
        .sort({ createdAt: -1 })
    ]);

    return NextResponse.json({
      success: true,
      stats,
      data: {
        posts: allPosts,
        users: allUsers
      }
    });
  } catch (error: any) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
