import webpush from "web-push";
import User from "@/models/User";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:support@finhuwa.ma",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

export async function sendPushNotification(userId: string, payload: { title: string; body: string; icon?: string; data?: any }) {
  try {
    const user = await User.findById(userId);
    if (!user || !user.pushSubscriptions || user.pushSubscriptions.length === 0) {
      return;
    }

    const notificationPayload = JSON.stringify(payload);

    const results = await Promise.allSettled(
      user.pushSubscriptions.map((sub: any) => 
        webpush.sendNotification(sub, notificationPayload)
      )
    );

    // Clean up expired subscriptions
    const failedIndices = results
      .map((res, i) => (res.status === "rejected" ? i : -1))
      .filter(i => i !== -1);

    if (failedIndices.length > 0) {
      const newSubs = user.pushSubscriptions.filter((_, i) => !failedIndices.includes(i));
      await User.findByIdAndUpdate(userId, { pushSubscriptions: newSubs });
    }

  } catch (error) {
    console.error("Error sending push notification:", error);
  }
}
