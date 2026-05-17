import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Post from "@/models/Post";
import { getUserIdFromSession } from "@/lib/auth";
import { findMatchesAndNotify } from "@/lib/matching";


export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const city = searchParams.get("city");
    const query = searchParams.get("q");
    const authorId = searchParams.get("author");

    const filter: any = { status: "active" };
    
    if (authorId === "me") {
      const currentUserId = await getUserIdFromSession();
      if (currentUserId) filter.author = currentUserId;
    } else if (authorId) {
      filter.author = authorId;
    }
    if (type && type !== "all") filter.type = type;
    if (category) filter.category = category;
    if (city) filter.city = city;
    if (query) filter.$text = { $search: query };

    // Spatial Search: $near
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const radius = searchParams.get("radius"); // in km
    if (lat && lng && radius) {
      filter.locationPoint = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
        }
      };
    }

    const now = new Date();

    // Fetch posts — DB sorts by boostRank desc, then createdAt desc via index
    const posts = await Post.find(filter)
      .sort({ boostRank: -1, createdAt: -1 })
      .populate("author", "name avatar isVerified role isPremium")
      .lean();

    // Enforce expiry in application layer:
    // Demote posts whose boost has expired (boostRank reset in next write)
    const PLAN_WEIGHTS: Record<string, number> = {
      premium: 5, pro: 4, standard: 3, basic: 2, starter: 1,
    };

    const sortedPosts = posts
      .map((p: any) => {
        const expired = p.boostExpiresAt && new Date(p.boostExpiresAt) < now;
        const authorRole = p.author?.role || "user";
        const authorIsPremium = p.author?.isPremium || false;
        
        // Base rank from boost
        let effectiveRank = expired ? 0 : (p.boostRank ?? PLAN_WEIGHTS[p.boostPlan ?? p.boostType ?? ""] ?? 0);
        
        // Partner bonus (e.g., +1 to rank)
        if (authorRole === "partner") effectiveRank += 1;
        if (authorIsPremium) effectiveRank += 0.5;

        return {
          ...p,
          _effectiveRank: effectiveRank,
        };
      })
      .sort((a: any, b: any) => {
        if (a._effectiveRank !== b._effectiveRank) return b._effectiveRank - a._effectiveRank;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

    return NextResponse.json({ success: true, data: sortedPosts.slice(0, 50) }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const postData: any = {
      ...body,
      location: body.location || "Agadir, Morocco",
      author: userId
    };


    if (body.locationCoords && typeof body.locationCoords.lat === 'number' && typeof body.locationCoords.lng === 'number') {
      postData.locationPoint = {
        type: 'Point',
        coordinates: [body.locationCoords.lng, body.locationCoords.lat]
      };
    }

    const newPost = await Post.create(postData);
    
    // Trigger matching algorithm in the background
    findMatchesAndNotify(newPost._id.toString()).catch(err => console.error("Matching trigger error:", err));
    
    return NextResponse.json({ success: true, data: newPost }, { status: 201 });

  } catch (error: any) {
    console.error("POST /api/posts error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
