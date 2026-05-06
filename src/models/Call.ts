import mongoose, { Schema, Document } from "mongoose";

export interface ICall extends Document {
  caller: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  status: "pending" | "ongoing" | "ended" | "missed" | "rejected";
  type: "audio" | "video";
  sdpOffer?: string;
  sdpAnswer?: string;
  callerIceCandidates: string[];
  receiverIceCandidates: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CallSchema: Schema = new Schema({
  caller: { type: Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
  status: { 
    type: String, 
    enum: ["pending", "ongoing", "ended", "missed", "rejected"], 
    default: "pending" 
  },
  type: { type: String, enum: ["audio", "video"], default: "audio" },
  sdpOffer: { type: String },
  sdpAnswer: { type: String },
  callerIceCandidates: [{ type: String }],
  receiverIceCandidates: [{ type: String }],
}, { timestamps: true });

export default mongoose.models.Call || mongoose.model<ICall>("Call", CallSchema);
