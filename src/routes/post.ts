import express from 'express';
import multer from "multer";

// Controller
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

// Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/image/post/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + removeSpaces(file.originalname));
  },
});



// Post Upload Location
const upload = multer({ storage: storage });

const router = express.Router();

// Post
router.post("/create", upload.array("photos"), createPost);
router.get("/getallPost", getPostsWithImages);
router.get("/getUserPost/:id", getUserPost);

// Like, Comment, Share
router.put('/like', likePost);
router.get('/like/count/:id', countLike);
router.get('/checkLike/:id/:userId', checkLike);

// Comment
router.get("/comment/:id", getAllComments);
router.post("/comment/add", createComment);
router.post("/comment/translate", translateComment);

router.get("/getImage", getPostImage);
router.delete("/deleteposts/:id", deletePost);
router.post("/Reactions", makeReaction);
router.post("/profanity", profanityChecker)
export default router;