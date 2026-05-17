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
  lat?: number;
  lng?: number;
  userId: mongoose.Types.ObjectId;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
}

const BusinessSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  businessName: { type: String, required: true },
  ownerName:    { type: String, required: true },
  email:        { type: String, required: true },
  phone:        { type: String, required: true },
  city:         { type: String, required: true },
  address:      { type: String, required: true },
  category:     { type: String, required: true },
  description:  { type: String, required: true },
  website:      { type: String },
  lat:          { type: Number },
  lng:          { type: Number },
  status:       { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
}, { timestamps: true });

export default mongoose.models.Business || mongoose.model<IBusiness>("Business", BusinessSchema);
