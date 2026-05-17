import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Post from "@/models/Post";
import User from "@/models/User";
import Business from "@/models/Business";

export async function GET() {
  try {
    await dbConnect();

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

    // Also fetch recent data for the lists
    const [recentPosts, recentUsers] = await Promise.all([
      Post.find({ status: { $ne: "deleted" } })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("author", "name email"),
      User.find()
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    return NextResponse.json({
      success: true,
      stats,
      data: {
        posts: recentPosts,
        users: recentUsers
      }
    });
  } catch (error: any) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
