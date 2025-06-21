const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = "devforumsecretkey123456"; // fixed secret

// Connect to local MongoDB or fallback to in-memory (for demo)
const mongoUri = "mongodb://localhost/devforum";
mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch(() => {
    console.error(
      "Failed to connect to MongoDB at " + mongoUri + ". Server shutting down."
    );
    process.exit(1);
  });

// Models
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  passwordHash: String,
  avatarUrl: String,
  bio: String,
});
const categorySchema = new mongoose.Schema({
  name: String,
  description: String,
});
const topicSchema = new mongoose.Schema({
  title: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});
const postSchema = new mongoose.Schema({
  content: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  topic: { type: mongoose.Schema.Types.ObjectId, ref: "Topic" },
  createdAt: { type: Date, default: Date.now },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});
const User = mongoose.model("User", userSchema);
const Category = mongoose.model("Category", categorySchema);
const Topic = mongoose.model("Topic", topicSchema);
const Post = mongoose.model("Post", postSchema);

// Auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Pre-load some categories & users if none exist (runs on start)
async function preloadData() {
  const catCount = await Category.countDocuments();
  if (catCount === 0) {
    await Category.create([
      { name: "Announcements", description: "Official updates" },
      { name: "General", description: "General discussion" },
      { name: "Help & Support", description: "Get help here" },
    ]);
    console.log("Sample categories created");
  }
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    const passwordHash = await bcrypt.hash("password123", 10);
    await User.create([
      { username: "admin", passwordHash, bio: "Admin user" },
      { username: "demoUser", passwordHash, bio: "Demo user" },
    ]);
    console.log("Sample users created (username: admin, password: password123)");
  }
}
preloadData();

// Routes

// Register
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Username and password required" });

  const existing = await User.findOne({ username });
  if (existing) return res.status(400).json({ error: "Username taken" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = new User({ username, passwordHash });
  await user.save();
  res.json({ message: "User created" });
});

// Login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, username: user.username });
});

// Get categories
app.get("/api/categories", async (req, res) => {
  const cats = await Category.find();
  res.json(cats);
});

// Get topics in category
app.get("/api/categories/:id/topics", async (req, res) => {
  const topics = await Topic.find({ category: req.params.id })
    .populate("author", "username")
    .sort({ createdAt: -1 });
  res.json(topics);
});

// Create topic
app.post("/api/topics", authMiddleware, async (req, res) => {
  const { title, categoryId } = req.body;
  if (!title || !categoryId)
    return res.status(400).json({ error: "Title and category required" });

  const topic = new Topic({
    title,
    category: categoryId,
    author: req.userId,
  });
  await topic.save();
  res.json(topic);
});

// Get posts in topic
app.get("/api/topics/:id/posts", async (req, res) => {
  const posts = await Post.find({ topic: req.params.id })
    .populate("author", "username")
    .sort({ createdAt: 1 });
  res.json(posts);
});

// Create post
app.post("/api/posts", authMiddleware, async (req, res) => {
  const { content, topicId } = req.body;
  if (!content || !topicId)
    return res.status(400).json({ error: "Content and topic required" });

  const post = new Post({
    content,
    topic: topicId,
    author: req.userId,
  });
  await post.save();
  await post.populate("author", "username");
  res.json(post);
});

// Like post
app.post("/api/posts/:id/like", authMiddleware, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });

  const liked = post.likes.includes(req.userId);
  if (liked) {
    post.likes.pull(req.userId);
  } else {
    post.likes.push(req.userId);
  }
  await post.save();
  res.json({ likes: post.likes.length, liked: !liked });
});

// Get user profile
app.get("/api/users/:username", async (req, res) => {
  const user = await User.findOne({ username: req.params.username }).select(
    "-passwordHash"
  );
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log("Forum backend running on port " + PORT);
});
