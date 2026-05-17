import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Business from "@/models/Business";
import { getUserIdFromSession } from "@/lib/auth";

// Update my own business info
export async function PATCH(req: Request) {
  try {
    await connectToDatabase();
    const userId = await getUserIdFromSession();
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    
    // Find and update business that belongs to this user
    const updatedBusiness = await Business.findOneAndUpdate(
      { userId },
      { 
        businessName: body.businessName,
        ownerName: body.ownerName,
        phone: body.phone,
        address: body.address,
        description: body.description,
        website: body.website,
        category: body.category
      },
      { new: true }
    );

    if (!updatedBusiness) {
      return NextResponse.json({ success: false, error: "Business not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedBusiness });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
