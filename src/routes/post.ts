import express from 'express';
import multer from "multer";

// Controller
import {
  createComment,
  createPost,
  deletePost,
  getPostImage,
  getPostsWithImages,
  makeReaction,
} from '../controller/user/post';

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

router.post("/create", upload.array("photos"), createPost);
router.get("/getallPost", getPostsWithImages);
router.get("/getImage", getPostImage);
router.delete("/deleteposts/:id", deletePost);
router.post("/comments", createComment);
router.post("/Reactions", makeReaction);

export default router;