import express from 'express';
import multer from "multer";

// Controller
import {
  checkLike,
  countLike,
  createComment,
  createPost,
  deletePost,
  getPostImage,
  getPostsWithImages,
  likePost,
  makeReaction,
} from '../controller/post';

// Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/image/post/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Post Upload Location
const upload = multer({ storage: storage });

const router = express.Router();

// Post
router.post("/create", upload.array("photos"), createPost);

// Like, Comment, Share
router.put('/like', likePost);
router.get('/like/count/:id', countLike);
router.get('/checkLike/:id/:userId', checkLike);

router.get("/getallPost", getPostsWithImages);
router.get("/getImage", getPostImage);
router.delete("/deleteposts/:id", deletePost);
router.post("/comments", createComment);
router.post("/Reactions", makeReaction);

export default router;