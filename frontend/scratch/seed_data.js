const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Manually parse .env.local to get MONGODB_URI
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
  boostPlan: String,
  boostRank: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const BusinessSchema = new mongoose.Schema({
  businessName: String,
  ownerName: String,
  email: String,
  phone: String,
  city: String,
  address: String,
  category: String,
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  isAdmin: Boolean,
});

const Post = mongoose.models.Post || mongoose.model("Post", PostSchema);
const Business = mongoose.models.Business || mongoose.model("Business", BusinessSchema);
const User = mongoose.models.User || mongoose.model("User", UserSchema);

const SAMPLE_POSTS = [
  {
    type: "lost",
    title: "مفاتيح سيارة داسيا مفقودة",
    description: "توضرات ليا ساروت داسيا فيها ميدالية ديال الجلد فـ شارع الحسن الثاني قرب مكدونالدز. لي لقاها يتصل بيا الله يجازيكم بخير.",
    category: "مفاتيح",
    location: "شارع الحسن الثاني، أكادير",
    city: "Agadir",
    date: new Date(),
    images: ["https://images.unsplash.com/photo-1582139329536-e7284fece509?q=80&w=500"],
    boosted: true,
    boostPlan: "pro",
    boostRank: 4,
  },
  {
    type: "found",
    title: "هاتف آيفون 13 موجود",
    description: "لقيت آيفون 13 فـ الطواليت ديال مرجان فونتي. لي تودر ليه يعطيني شنو كاين فـ الـ wallpaper باش يتسلمو.",
    category: "إلكترونيات",
    location: "مرجان فونتي، أكادير",
    city: "Agadir",
    date: new Date(),
    images: ["https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=500"],
  },
  {
    type: "lost",
    title: "قطة بيضاء مفقودة (حي السلام)",
    description: "قطة مشمشة بيضاء توضرات فـ حي السلام. سميتها 'لولو'. عافاكم لي شافها يعلمنا.",
    category: "حيوانات أليفة",
    location: "حي السلام، أكادير",
    city: "Agadir",
    date: new Date(),
    images: ["https://images.unsplash.com/photo-1533738363-b7f9aef128ce?q=80&w=500"],
  },
  {
    type: "found",
    title: "محفظة نقود سوداء فـ تالبورجت",
    description: "لقيت بزدام كحل فيه بطاقة وطنية ورخصة سياقة باسم 'ياسين ب.'. لي ديالو يتصل بيا.",
    category: "محافظ وبطاقات",
    location: "تالبورجت، أكادير",
    city: "Agadir",
    date: new Date(),
    images: ["https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=500"],
  },
  {
    type: "lost",
    title: "نظارات طبية مفقودة",
    description: "توضروا ليا نظارات رايبان فـ البحر (مارينا). كادر كحل.",
    category: "إكسسوارات",
    location: "مارينا، أكادير",
    city: "Agadir",
    date: new Date(),
    images: ["https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=500"],
  }
];

const SAMPLE_BUSINESSES = [
  {
    businessName: "محطة أمن أكادير المركزية",
    ownerName: "الإدارة العامة",
    email: "police@agadir.ma",
    phone: "0528000000",
    city: "Agadir",
    address: "شارع الأمير مولاي عبد الله",
    category: "أمن",
    status: "approved"
  },
  {
    businessName: "مقهى الأمل - نقطة ثقة",
    ownerName: "سعيد العلمي",
    email: "café.amal@gmail.com",
    phone: "0661000000",
    city: "Agadir",
    address: "تالبورجت، أكادير",
    category: "مقهى",
    status: "approved"
  }
];

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected!");

    const admin = await User.findOne({ email: "med2005@gmail.com" });
    const authorId = admin ? admin._id : new mongoose.Types.ObjectId();

    console.log("Adding posts...");
    for (const p of SAMPLE_POSTS) {
      await Post.create({ ...p, author: authorId });
    }

    console.log("Adding businesses...");
    for (const b of SAMPLE_BUSINESSES) {
      await Business.create(b);
    }

    console.log("Seeding complete successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
