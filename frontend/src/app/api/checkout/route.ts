import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getUserIdFromSession } from "@/lib/auth";
import User from "@/models/User";
import connectToDatabase from "@/lib/mongodb";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2026-04-22.dahlia",
});


export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { postId, planId, planName, price, testMode } = await req.json();

    if (!postId || !planId || !price) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(price * 100),
      currency: "mad",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: userId.toString(),
        postId: postId.toString(),
        planId: planId.toString(),
        planName: planName
      },
    });

    return NextResponse.json({ 
      success: true, 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error: any) {
    console.error("Payment error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
