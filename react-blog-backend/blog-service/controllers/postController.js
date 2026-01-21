const Post = require("../models/Posts");
const Tag = require("../models/Tags");
const Category = require("../models/Category");
const Comment = require("../models/Comments");
const Like = require("../models/Like");
const { cleanUpTags, cleanUpCategories } = require("../utils/cleanup");
const paginate = require("../utils/paginationUtil");
const logger = require("../blogLogs/logger"); // Import logger for logging request and response details
const { options } = require("../routes/postRoutes");

// Helper function to create or retrieve tags
const createOrGetTags = async (tags) => {
  const tagIds = [];
  for (const tagName of tags) {
    let tag = await Tag.findOne({ name: tagName });
    if (!tag) {
      // Create a new tag if it doesn't exist
      tag = new Tag({ name: tagName });
      await tag.save();
    }
    tagIds.push(tag._id);
  }
  return tagIds;
};

// Helper function to create or retrieve categories
const createOrGetCategories = async (categories) => {
  const categoryIds = [];
  for (const categoryName of categories) {
    let category = await Category.findOne({ name: categoryName });
    if (!category) {
      // Create a new category if it doesn't exist
      category = new Category({ name: categoryName });
      await category.save();
    }
    categoryIds.push(category._id);
  }
  return categoryIds;
};

// Fetch all posts with pagination
exports.getPosts = async (req, res) => {
  const { page = 1, results_per_page = 5 } = req.query;
  try {
    const posts = await Post.find()
      .skip((page - 1) * results_per_page)
      .limit(Number(results_per_page))
      .populate("author tags categories comments");
    const totalPosts = await Post.countDocuments();
    // Return posts, total pages, and current page
    res.json({
      posts,
      totalPages: Math.ceil(totalPosts / results_per_page),
      currentPage: Number(page)
    });
  } catch (error) {
    console.error("Error fetching posts:", error); // Detailed error logging

    res.status(500).json({ message: "Failed to fetch posts", error: error.message });
  }
};

// Fetch a single post by ID
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author tags categories comments");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    // Count likes for the post
    const likeCount = await Like.countDocuments({ post: post._id });
    res.json({ ...post.toObject(), likeCount });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch post", error: error.message });
  }
};

// Create a new post
exports.createPost = async (req, res) => {
  const { title, content, tags, categories } = req.body;

  try {
    logger.info("Received request to create a new post", { title, tags, categories });

    // Create or retrieve associated tags and categories
    const tagIds = await createOrGetTags(tags);
    logger.info("Tags processed successfully", { tagIds });

    const categoryIds = await createOrGetCategories(categories);
    logger.info("Categories processed successfully", { categoryIds });

    // Create and save the post
    const post = new Post({
      title,
      content,
      tags: tagIds,
      categories: categoryIds,
      author: req.user.id,
    });

    await post.save();
    logger.info("Post created successfully", { postId: post._id });

    res.status(201).json({ message: "Post created successfully", post });
  } catch (error) {
    logger.error(`Error occurred while creating a post: ${error.message} ${error.stack}`);
    res.status(500).json({ message: "Failed to create post", error: error.message });
  }
};

exports.updatePost = async (req, res) => {
  const { title, content, tags, categories } = req.body;
  try {
    const post = await Post.findById(req.params.id)
      .populate("author tags categories comments");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.author != req.user.id) {
      return res.status(403).json({ message: "The author and user do not match" });
    }
    const updatedData = {}
    if (title) {
      updatedData.title = title
    }
    if (content) {
      updatedData.content = content
    }
    if (tags) {
      const tagIds = await createOrGetTags(tags)
      updatedData.tags = tagIds
    }
    if (categories) {
      const categoryIds = await createOrGetCategories(categories)
      updatedData.categories = categoryIds
    }
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, updatedData, { new: true })
    console.log(updatedPost)
    return res.status(200).json({ message: "Post udpated successfully", updatedPost });
  } catch (error) {
    console.error("Error updating posts:", error); // Detailed error logging
    res.status(500).json({ message: "Failed to update posts", error: error.message });
  }
}

exports.deletePost = async (req, res) => {
  console.log("sanity check")
  try {
    const post = await Post.findById(req.params.id)
    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }
    if (post.author != req.user.id) {
      return res.status(403).json({ message: "The author and user do not match" })
    }
    await Like.deleteMany();
    await Comment.deleteMany();
    await post.deleteOne();
    cleanUpTags();
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error updating posts:", error); // Detailed error logging
    res.status(500).json({ message: "Failed to update posts", error: error.message });
  }
}

