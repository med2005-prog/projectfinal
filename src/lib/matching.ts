import Post from "@/models/Post";
import Notification from "@/models/Notification";
import connectToDatabase from "./mongodb";
import { sendPushNotification } from "./push";

/**
 * Advanced Matching Algorithm
 * 1. Filters by Category & Opposite Type (Lost vs Found)
 * 2. Uses Text Search Score for Title/Description similarity
 * 3. Filters by City
 * 4. Filters by Date (Found date must be >= Lost date)
 */
export async function findMatchesAndNotify(postId: string) {
  try {
    await connectToDatabase();
    
    const post = await Post.findById(postId);
    if (!post) return;

    const isLost = post.type === "lost";
    const matchType = isLost ? "found" : "lost";
    
    // Clean search string: remove special chars
    const searchString = `${post.title} ${post.description}`.replace(/[^\w\s\u0600-\u06FF]/gi, ' ');

    const filter: any = {
      _id: { $ne: post._id },
      type: matchType,
      category: post.category,
      status: "active",
      $text: { $search: searchString }
    };

    // Date constraint
    if (isLost) {
      filter.date = { $gte: post.date };
    } else {
      filter.date = { $lte: post.date };
    }

    if (post.city) {
      filter.city = post.city;
    }

    const matches = await Post.find(filter)
      .sort({ score: { $meta: "textScore" } })
      .limit(5);

    for (const match of matches) {
      const matchTitle = "Potential Match! 🔍";
      const matchMessage = `Your post "${match.title}" has a potential match: "${post.title}".`;
      
      // 1. In-app Notification for Match owner
      await Notification.create({
        recipient: match.author,
        sender: post.author,
        type: "match",
        title: matchTitle,
        message: matchMessage,
        link: `/posts/${post._id}`
      });

      // Push Notification for Match owner
      sendPushNotification(match.author.toString(), {
        title: matchTitle,
        body: matchMessage,
        data: { url: `/posts/${post._id}` }
      });

      // 2. In-app Notification for Current User
      await Notification.create({
        recipient: post.author,
        sender: match.author,
        type: "match",
        title: matchTitle,
        message: `We found a match for your new post: "${match.title}". Check it now!`,
        link: `/posts/${match._id}`
      });
      
      // Push Notification for Current User
      sendPushNotification(post.author.toString(), {
        title: matchTitle,
        body: `We found a match for your new post: "${match.title}".`,
        data: { url: `/posts/${match._id}` }
      });
    }

    return matches;
  } catch (error) {
    console.error("Smart Matching Engine Error:", error);
  }
}
