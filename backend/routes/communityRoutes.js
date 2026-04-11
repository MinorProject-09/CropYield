const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const upload = require("../config/multerCommunity");
const {
  getPosts, getPost, createPost,
  upvotePost, addAnswer, upvoteAnswer, deletePost,
} = require("../controllers/communityController");

router.get("/posts",                          auth, getPosts);
router.get("/posts/:id",                      auth, getPost);
router.post("/posts",                         auth, upload.array("images", 3), createPost);
router.post("/posts/:id/upvote",              auth, upvotePost);
router.post("/posts/:id/answers",             auth, addAnswer);
router.post("/posts/:id/answers/:aid/upvote", auth, upvoteAnswer);
router.delete("/posts/:id",                   auth, deletePost);

module.exports = router;
