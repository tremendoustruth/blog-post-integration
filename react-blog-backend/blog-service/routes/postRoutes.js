const express = require("express");
const {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost
} = require("../controllers/postController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Fetch all posts with pagination
router.get("/", protect, getPosts); // GET /api/posts

// Fetch a single post by ID
router.get("/:id", protect, getPostById); // GET /api/posts/:id

// Create a new post
router.post("/", protect, createPost); // POST /api/posts

// Edit a post
router.patch("/:id", protect, updatePost)

// Delete a post
router.delete("/:id", protect, deletePost)

module.exports = router;
