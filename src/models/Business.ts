import mongoose, { Schema, Document } from "mongoose";

export interface IBusiness extends Document {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  category: string;
  description: string;
  website?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
}

const BusinessSchema: Schema = new Schema({
  businessName: { type: String, required: true },
  ownerName:    { type: String, required: true },
  email:        { type: String, required: true },
  phone:        { type: String, required: true },
  city:         { type: String, required: true },
  address:      { type: String, required: true },
  category:     { type: String, required: true },
  description:  { type: String, required: true },
  website:      { type: String },
  status:       { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
}, { timestamps: true });

export default mongoose.models.Business || mongoose.model<IBusiness>("Business", BusinessSchema);
