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

const UserSchema = new mongoose.Schema({ name: String, email: String });
const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function fix() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to DB");

  const updates = [
    { email: "med2005@gmail.com", name: "محمد المالكي" },
    { email: "yassine@example.com", name: "ياسين بلمكي" },
    { email: "meryem@example.com", name: "مريم الفاسي" },
    { email: "police@agadir.ma", name: "أمن أكادير" }
  ];

  for (const up of updates) {
    await User.findOneAndUpdate({ email: up.email }, { name: up.name });
    console.log(`Updated ${up.email} to ${up.name}`);
  }

  // Update any other generic names
  await User.updateMany({ name: "System User" }, { name: "مستخدم النظام" });

  console.log("Names fixed!");
  process.exit(0);
}

fix();
