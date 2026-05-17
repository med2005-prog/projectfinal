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

const PostSchema = new mongoose.Schema({ title: String });
const BusinessSchema = new mongoose.Schema({ businessName: String });

const Post = mongoose.models.Post || mongoose.model("Post", PostSchema);
const Business = mongoose.models.Business || mongoose.model("Business", BusinessSchema);

async function clearData() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected!");

    // Delete all posts and dummy businesses
    const postResult = await Post.deleteMany({});
    console.log(`Deleted ${postResult.deletedCount} posts.`);

    const businessResult = await Business.deleteMany({});
    console.log(`Deleted ${businessResult.deletedCount} businesses.`);

    console.log("✅ Platform cleaned up successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Failed to clean data:", err);
    process.exit(1);
  }
}

clearData();
