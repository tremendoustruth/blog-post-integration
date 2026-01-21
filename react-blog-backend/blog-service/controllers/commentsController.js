const mongoose = require('mongoose');
const Comment = require("../models/Comments");
const Post = require("../models/Posts");
const User = require("../models/User");
const logger = require("../blogLogs/logger");

exports.addComment = async (req, res) => {
    const postId = req.params.postId;
    const { content } = req.body;
    try {
        logger.info("Received request to add a new comment", { content, postId });
        const post = await Post.findById(postId)
            .populate("author tags categories comments");
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        // Create and save the comment
        const comment = new Comment({
            author: req.user.id,
            content,
            postId,
        });
        await comment.save();
        post.comments.push(comment._id);
        await post.save();
        logger.info("Comment added successfully", { commentId: comment._id });
        res.status(201).json({ message: "Comment added successfully", comment });

    } catch (error) {
        logger.error(`Error occurred while creating a comment: ${error.message} ${error.stack}`);
        res.status(500).json({ message: "Failed to create comment", error: error.message });
    }
};


//Fetch all comments for a post by post id
exports.getComments = async (req, res) => {
    const postId = req.params.postId;
    try {
        const comments = await Comment.find({ postId })
            .populate("author", "name email");
        if (!comments) {
            return res.status(404).json({ message: "Comments not found" });
        }
        res.json({ comments });
    } catch (error) {
        console.error("Error fetching comments:", error); // Detailed error logging

        res.status(500).json({ message: "Failed to fetch comments", error: error.message });
    }
};

// Fetch a single comment by comment id
exports.getCommentById = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id)
            .populate("author", "name email");
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        res.json({ comment });
    } catch (error) {
        console.error("Error fetching comment:", error); // Detailed error logging

        res.status(500).json({ message: "Failed to fetch comment", error: error.message });
    };
}

exports.editComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        if (comment.author != req.user.id) {
            return res.status(403).json({ message: "The author and user do not match" });
        }
        comment.content = req.body.content
        comment.save()
        res.status(200).json({ message: "Comment edited successfully" })
    } catch (error) {
        console.error("Error editing comment:", error); // Detailed error logging

        res.status(500).json({ message: "Failed to edit comment", error: error.message });
    };
}

exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id)
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        if (comment.author != req.user.id) {
            return res.status(403).json({ message: "The author and user do not match" });
        }
        await comment.deleteOne();
        res.status(200).json({ message: "Comment deleted successfully" })

    } catch (error) {
        console.error("Error editing comment:", error); // Detailed error logging

        res.status(500).json({ message: "Failed to edit comment", error: error.message });
    };
}

// TODO
// 1. Import Models
// Objective: Use Mongoose models for comments and posts.
// Steps:
// Ensure Comment and Post models are imported.

// 2. Fetch All Comments for a Post
// Objective: Retrieve all comments associated with a specific post ID.
// Steps:
// Use Comment.find() to fetch comments where post matches req.params.id.
// Use populate() to include details about the author (e.g., name and email).
// Handle errors by wrapping the logic in a try...catch block.
// Return the fetched comments as a JSON response.

// 3. Fetch a Single Comment by ID
// Objective: Retrieve a specific comment using its ID.
// Steps:
// Use Comment.findById() to fetch the comment by req.params.id.
// Use populate() to include author details.
// Check if the comment exists; if not, return a 404 Not Found response.
// Handle errors and return a JSON response with the comment or error message.

// 4. Add a New Comment
// Objective: Add a comment to a specific post.
// Steps:
// Extract content from req.body.
// Use Post.findById() to verify the existence of the post associated with req.params.id.
// Create a new comment with the content, author (from req.user.id), and post ID.
// Save the comment using comment.save().
// Update the post's comments array by pushing the new comment's ID and saving the post.
// Handle errors and return a success response with the add comment.

// 5. Edit a Comment
// Objective: Allow the author to edit their comment.
// Steps:
// Use Comment.findById() to fetch the comment by req.params.id.
// Verify the comment exists; if not, return a 404 Not Found response.
// Check if the logged-in user (req.user.id) matches the comment's author.
// Update the comment's content with the new value from req.body.content.
// Save the updated comment using comment.save().
// Handle errors and return a success response with the updated comment.

// 6. Delete a Comment
// Objective: Allow the author to delete their comment.
// Steps:
// Use Comment.findById() to fetch the comment by req.params.id.
// Verify the comment exists; if not, return a 404 Not Found response.
// Check if the logged-in user (req.user.id) matches the comment's author.
// Use comment.deleteOne() to delete the comment from the database.
// Update the associated post by removing the comment ID from its comments array using Post.updateOne() with $pull.
// Handle errors and return a success response.


// 7. Integrate with Routes
// Objective: Connect these controller functions to the Express routes.
// Steps:
// Import these functions into the comments router file.
// Define the routes and attach the corresponding controller functions:
// GET /comments/:id → getComments
// POST /comments/:id → addComment
// PUT /comments/:id → editComment
// DELETE /comments/:id → deleteComment
