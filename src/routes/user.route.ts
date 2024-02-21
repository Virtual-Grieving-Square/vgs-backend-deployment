import { Recoverable } from "repl";
import {
  login,
  requestPasswordReset,
  resetPassword,
  signup,
} from "../controller/user/auth.controller";
import { createComment, createPost, deletePost, getPostsWithImages, makeReaction } from "../controller/user/post.controller";
import express from "express";
import multer from 'multer';

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname) 
  }
});


const upload = multer({ storage: storage });



const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/resetPassword", resetPassword);
router.post("/recoverPassword", requestPasswordReset);

// Media Post Api

router.post("/createPost", upload.array('photos'), createPost);
router.get("/getallPost",  getPostsWithImages);
router.delete('/deleteposts/:id', deletePost);
router.post('/comments', createComment);
router.post('/Reactions', makeReaction);

export default router;
