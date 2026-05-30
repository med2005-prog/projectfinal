import { NextResponse } from "next/server";
import Stripe from "stripe";
import connectToDatabase from "@/lib/mongodb";
import Post, { BoostPlan } from "@/models/Post";
import { BOOST_CONFIG } from "@/lib/config/boost";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2026-04-22.dahlia",
});


const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") || "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature error:", err.message);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "payment_intent.succeeded") {
    const sessionOrIntent = event.data.object as any;
    const { postId, planId } = sessionOrIntent.metadata || {};

    if (postId && planId) {
      try {
        await connectToDatabase();

        const config = BOOST_CONFIG[planId as BoostPlan];
        const hours = config?.durationHours || 24;
        const rank = config?.rank || 1;

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + hours);

        await Post.findByIdAndUpdate(postId, {
          boosted: true,
          boostPlan: planId,
          boostType: planId, // backward compat
          boostExpiresAt: expiresAt,
          boostRank: rank,
          targetViews: config?.targetViews || 0,
        });


        console.log(`✅ Post ${postId} boosted via ${event.type} with plan: ${planId}`);
      } catch (err) {
        console.error("DB update error after payment:", err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
