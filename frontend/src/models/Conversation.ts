import mongoose, { Schema, Document } from "mongoose";

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  lastMessage?: string;
  lastMessageAt: Date;
  item: mongoose.Types.ObjectId;
}

const ConversationSchema: Schema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
  lastMessage: { type: String },
  lastMessageAt: { type: Date, default: Date.now },
  item: { type: Schema.Types.ObjectId, ref: "Post" }
}, { timestamps: true });

export default mongoose.models.Conversation || mongoose.model<IConversation>("Conversation", ConversationSchema);
