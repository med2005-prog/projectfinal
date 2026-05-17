import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  post: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  content?: string;
  type: "text" | "audio";
  audioUrl?: string;
  transcription?: string;
  isRead: boolean;
  createdAt: Date;
}

const MessageSchema: Schema = new Schema({
  conversationId: { type: Schema.Types.ObjectId, ref: "Conversation" },
  post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String },
  type: { type: String, enum: ["text", "audio"], default: "text" },
  audioUrl: { type: String },
  transcription: { type: String },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);
