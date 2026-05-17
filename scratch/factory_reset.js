const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "../.env.local");
let MONGODB_URI = "";

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  const match = envContent.match(/MONGODB_URI=(.*)/);
  if (match) MONGODB_URI = match[1].trim();
}

if (!MONGODB_URI) {
  console.error("Could not find MONGODB_URI in .env.local");
  process.exit(1);
}

const PostSchema = new mongoose.Schema({}, { strict: false });
const BusinessSchema = new mongoose.Schema({}, { strict: false });
const UserSchema = new mongoose.Schema({ email: String }, { strict: false });
const ChatSchema = new mongoose.Schema({}, { strict: false });
const MessageSchema = new mongoose.Schema({}, { strict: false });

const Post = mongoose.models.Post || mongoose.model("Post", PostSchema);
const Business = mongoose.models.Business || mongoose.model("Business", BusinessSchema);
const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Chat = mongoose.models.Chat || mongoose.model("Chat", ChatSchema);
const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);

async function factoryReset() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected! Starting factory reset...");

    // Delete everything
    const postRes = await Post.deleteMany({});
    console.log(`🧹 Deleted ${postRes.deletedCount} posts.`);

    const bizRes = await Business.deleteMany({});
    console.log(`🧹 Deleted ${bizRes.deletedCount} businesses.`);

    const chatRes = await Chat.deleteMany({});
    console.log(`🧹 Deleted ${chatRes.deletedCount} chats.`);

    const msgRes = await Message.deleteMany({});
    console.log(`🧹 Deleted ${msgRes.deletedCount} messages.`);

    // Delete users except the admin
    const userRes = await User.deleteMany({ email: { $ne: "med2005@gmail.com" } });
    console.log(`🧹 Deleted ${userRes.deletedCount} non-admin users.`);

    console.log("✅ Site is completely BRAND NEW and ready for production!");
    process.exit(0);
  } catch (err) {
    console.error("Factory reset failed:", err);
    process.exit(1);
  }
}

factoryReset();
