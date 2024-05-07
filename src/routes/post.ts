import express from 'express';
import multer from "multer";

import {
  checkLike,
  countLike,
  createComment,
  createPost,
  deletePost,
  getAllComments,
  getPostImage,
  getPostsWithImages,
  getUserPost,
  likePost,
  makeReaction,
  profanityChecker,
  translateComment
} from '../controller/post';

import { removeSpaces } from '../util/removeSpace';

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const router = express.Router();

// Post
router.post("/create", upload.single("photos"), createPost);
router.get("/getallPost", getPostsWithImages);
router.get("/getUserPost/:id", getUserPost);

// Like, Comment, Share
router.put('/like', likePost);
router.get('/like/count/:id', countLike);
router.get('/checkLike/:id/:userId', checkLike);

// Comment
router.get("/comment/:id", getAllComments);
router.post("/comment/add", createComment);
router.post("/translate", translateComment);

// Get Image
router.get("/getImage", getPostImage);
router.delete("/deleteposts/:id", deletePost);
router.post("/Reactions", makeReaction);
router.post("/profanity", profanityChecker)
export default router;