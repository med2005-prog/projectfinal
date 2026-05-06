import mongoose, { Schema, Document } from "mongoose";

export type BoostPlan = "starter" | "basic" | "standard" | "pro" | "premium";

export interface IPost extends Document {
  type: "lost" | "found";
  title: string;
  description: string;
  category: string;
  location: string;
  city: string;
  date: Date;
  images: string[];
  locationCoords?: {
    lat: number;
    lng: number;
  };
  author: mongoose.Types.ObjectId;
  status: "active" | "resolved" | "deleted";
  boosted: boolean;
  boostPlan?: BoostPlan;
  /** @deprecated use boostPlan */
  boostType?: string;
  boostExpiresAt?: Date;
  boostRank: number; // 0=normal, 1=starter, 2=basic, 3=standard, 4=pro, 5=premium
  views: number;
  targetViews?: number; // The guaranteed views from the boost plan
  clicks: number;
  createdAt: Date;
}

const PostSchema: Schema = new Schema({
  type: { type: String, enum: ["lost", "found"], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  city: { type: String, required: true, default: "Agadir" },
  date: { type: Date, required: true },
  images: [{ type: String }],
  locationCoords: {
    lat: { type: Number },
    lng: { type: Number }
  },
  // GeoJSON for spatial queries
  locationPoint: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: false } // [longitude, latitude]
  },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["active", "resolved", "deleted"], default: "active" },

  // Monetization fields
  boosted: { type: Boolean, default: false },
  boostPlan: { type: String, enum: ["starter", "basic", "standard", "pro", "premium"] },
  boostType: { type: String }, // kept for backward compat
  boostExpiresAt: { type: Date },
  boostRank: { type: Number, default: 0 }, // for efficient sort

  // Analytics
  views: { type: Number, default: 0 },
  targetViews: { type: Number },
  clicks: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now }
});

// Text search index
PostSchema.index({ title: "text", description: "text" });
// Geo index for spatial queries
PostSchema.index({ locationPoint: "2dsphere" });
// Ranking index: highest rank first, then newest
PostSchema.index({ boostRank: -1, createdAt: -1 });

export default mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);
