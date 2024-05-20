import express from 'express';
import multer from "multer";

import {
  checkLike,
  countComment,
  countLike,
  createComment,
  createPost,
  deletePost,
  getAllComments,
  getPostImage,
  getAll,
  getRecent3Posts,
  getUserPost,
  likePost,
  makeReaction,
  profanityChecker,
  translateComment,
  searchPost
} from '../controller/post';

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const router = express.Router();

// Post
router.post("/create", upload.array("photos"), createPost);

// Get POsts
router.get("/getAll", getAll);
router.get("/getRecent3Posts", getRecent3Posts)
router.get("/getUserPost/:id", getUserPost);

// Like, Comment, Share
router.put('/like', likePost);
router.get('/like/count/:id', countLike);
router.get("/comment/count/:id", countComment);
router.get('/checkLike/:id/:userId', checkLike);

// Comment
router.get("/comment/:id", getAllComments);
router.post("/comment/add", createComment);
router.post("/translate", translateComment);

// Get Image
router.get("/getImage", getPostImage);

// Delete
router.delete("/delete/:id", deletePost);
router.post("/Reactions", makeReaction);
router.post("/profanity", profanityChecker);

// Search Post
router.get("/search", searchPost);


export default router;