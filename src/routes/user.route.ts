import { Recoverable } from "repl";
import {
  login,
  requestPasswordReset,
  resetPassword,
  signup,
} from "../controller/user/auth.controller";
import {
  createComment,
  createPost,
  deletePost,
  getPostsWithImages,
  makeReaction,
} from "../controller/user/post.controller";
import express from "express";
import multer from "multer";
import {
  addComments,
  addGroupMembers,
  createGallery,
  createGroup,
  getGalleryByGroupId,
  groupWriting,
} from "../controller/user/group.controller";

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const secondStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/gallary");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });
const uploadGallary = multer({ storage: secondStorage });

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/resetPassword", resetPassword);
router.post("/recoverPassword", requestPasswordReset);

// Media Post Api

router.post("/createPost", upload.array("photos"), createPost);
router.get("/getallPost", getPostsWithImages);
router.delete("/deleteposts/:id", deletePost);
router.post("/comments", createComment);
router.post("/Reactions", makeReaction);

// interactive Group
router.post("/createGroup", createGroup);
router.post("/addGroupMember", addGroupMembers);
router.post("/addGallery", uploadGallary.array("photos"), createGallery);
router.get("/gallery/:groupId", getGalleryByGroupId);
router.get("/group/writing", groupWriting);
router.get("/group/comment", addComments);

export default router;
