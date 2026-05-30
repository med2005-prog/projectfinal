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

    await connectToDatabase();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Find or create Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user._id.toString() }
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXTAUTH_URL}/settings`,
    });

    return NextResponse.json({ success: true, url: session.url });

  } catch (error: any) {
    console.error("Stripe portal error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
