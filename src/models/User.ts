import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  phone?: string;
  role: "user" | "partner";
  isPremium: boolean;
  isVerified: boolean; // email or identity verified
  isPhoneVerified?: boolean;
  verificationCode?: string;
  verificationCodeExpiresAt?: Date;
  subscriptionPlan: "none" | "starter" | "pro" | "enterprise";
  subscriptionExpiresAt?: Date;
  stripeCustomerId?: string;
  hasUsedFreeBoost: boolean;
  notifications: {
    push: boolean;
    email: boolean;
    matching: boolean;
    hidePhoneUntilAccepted: boolean;
    showEmail: boolean;
  };
  favorites: mongoose.Types.ObjectId[];
  pushSubscriptions: any[];
  isAdmin: boolean;
  lastSeen: Date;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  avatar: { type: String },
  phone: { type: String },
  role: { 
    type: String, 
    enum: ["user", "partner"], 
    default: "user" 
  },
  isPremium: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  verificationCodeExpiresAt: { type: Date },
  isAdmin: { type: Boolean, default: false },
  
  // Business fields
  subscriptionPlan: { 
    type: String, 
    enum: ["none", "starter", "pro", "enterprise"], 
    default: "none" 
  },
  subscriptionExpiresAt: { type: Date },
  stripeCustomerId: { type: String },
  
  // Settings
  notifications: {
    push: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    matching: { type: Boolean, default: true },
    hidePhoneUntilAccepted: { type: Boolean, default: true },
    showEmail: { type: Boolean, default: false },
  },
  
  // Freemium tracking
  hasUsedFreeBoost: { type: Boolean, default: false },
  favorites: [{ type: Schema.Types.ObjectId, ref: "Post" }],
  pushSubscriptions: [{ type: Object }],
  
  // Online tracking
  lastSeen: { type: Date, default: Date.now },
  
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
