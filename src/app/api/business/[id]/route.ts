import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Business from "@/models/Business";
import User from "@/models/User";

// Update status (approve/reject)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const { status } = await req.json();
    
    const business = await Business.findByIdAndUpdate(id, { status }, { new: true });
    
    if (status === "approved" && business) {
      // Try to find the user by userId first, then by email
      let user = null;
      
      if (business.userId) {
        user = await User.findByIdAndUpdate(business.userId, {
          role: "partner",
          isVerified: true
        });
      }
      
      // If no user found by ID, search by email
      if (!user && business.email) {
        user = await User.findOneAndUpdate(
          { email: business.email },
          { role: "partner", isVerified: true },
          { new: true }
        );
        
        // Also link the userId if we found one
        if (user) {
          await Business.findByIdAndUpdate(id, { userId: user._id });
        }
      }
    }

    return NextResponse.json({ success: true, data: business });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Delete a business
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    await Business.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
