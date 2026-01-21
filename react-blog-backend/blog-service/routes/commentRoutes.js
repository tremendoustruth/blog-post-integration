const express = require("express");
const {
    getComments,
    getCommentById,
    addComment,
    editComment,
    deleteComment
} = require("../controllers/commentsController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

// Featch comments by post id
router.get("/posts/:postId/comments", protect, getComments);

// // Fetch a single comment by comment id
router.get("/comments/:id", protect, getCommentById);

// Create a new comment
router.post("/posts/:postId/comments", protect, addComment);

// // edit existing comment by comment id
router.put("/comments/:id", protect, editComment)

// // Delete comment by comment id
router.delete("/comments/:id", protect, deleteComment)

module.exports = router;
