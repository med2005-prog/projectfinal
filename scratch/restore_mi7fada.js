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

const PostSchema = new mongoose.Schema({
  type: String,
  title: String,
  description: String,
  category: String,
  location: String,
  city: String,
  date: Date,
  images: [String],
  author: mongoose.Schema.Types.ObjectId,
  status: { type: String, default: "active" },
  boosted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({ email: String });

const Post = mongoose.models.Post || mongoose.model("Post", PostSchema);
const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function restore() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    // Clear all posts
    await Post.deleteMany({});
    
    // Find admin user
    const admin = await User.findOne({ email: "med2005@gmail.com" });
    const authorId = admin ? admin._id : new mongoose.Types.ObjectId();

    // Recreate the real 'mi7fada' post
    await Post.create({
      type: "lost",
      title: "mi7fada",
      description: "توضرات ليا محفظة (mi7fada) فيها وراق مهمين. لي لقاها يتصل بيا.",
      category: "حقائب",
      location: "أكادير",
      city: "Agadir",
      date: new Date(),
      images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=500"], // generic backpack image
      author: authorId,
    });

    console.log("Restored the mi7fada post!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

restore();
