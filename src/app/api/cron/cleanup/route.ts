import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Post from '@/models/Post';

export async function GET(req: Request) {
  // Simple security check using an environment variable
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();

    const now = new Date();

    // 1. Expire Boosts
    const expiredBoosts = await Post.updateMany(
      { boosted: true, boostExpiresAt: { $lt: now } },
      { $set: { boosted: false, boostRank: 0, boostPlan: null } }
    );


    // 2. Archive Old Posts (Older than 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const archivedPosts = await Post.updateMany(
      { createdAt: { $lt: sixMonthsAgo }, status: 'active' },
      { $set: { status: 'archived' } }
    );

    return NextResponse.json({
      success: true,
      data: {
        expiredBoosts: expiredBoosts.modifiedCount,
        archivedPosts: archivedPosts.modifiedCount
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
