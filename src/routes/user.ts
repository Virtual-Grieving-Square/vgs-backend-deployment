import { Recoverable } from "repl";
import {
  login,
  requestPasswordReset,
  resetPassword,
  signup,
  verify,
} from "../controller/user/auth";
import {
  createComment,
  createPost,
  deletePost,
  getPostImage,
  getPostsWithImages,
  makeReaction,
} from "../controller/user/post";
import express from "express";
import multer from "multer";
import {
  addComments,
  addGroupMembers,
  createGallery,
  createGroup,
  getGalleryByGroupId,
  groupWriting,
} from "../controller/user/group";

import { createPetMemorial } from "../controller/user/pet";

import {
  getDetails,
  uploadProfileImage
} from "../controller/user/user";

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/image/post/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const secondStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/image/post");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
})

const profileImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/image/profileImage");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });
const uploadGallary = multer({ storage: secondStorage });
const uploadProfile = multer({ storage: profileImageStorage });

const router = express.Router();

// Auth
router.post("/signup", signup);
router.post("/verify", verify);
router.post("/login", login);
router.post("/resetPassword", resetPassword);
router.post("/recoverPassword", requestPasswordReset);

// User 
router.get('/getDetails/:id', getDetails);
router.post("/uploadProfileImage", uploadProfile.array("photo"), uploadProfileImage);


// Media Post Api
router.post("/createPost", upload.array("photos"), createPost);
router.get("/getallPost", getPostsWithImages);
router.get("/post/getImage", getPostImage);
router.delete("/deleteposts/:id", deletePost);
router.post("/comments", createComment);
router.post("/Reactions", makeReaction);

// Interactive Group
router.post("/createGroup", createGroup);
router.post("/addGroupMember", addGroupMembers);
router.post("/addGallery", uploadGallary.array("photos"), createGallery);
router.get("/gallery/:groupId", getGalleryByGroupId);
router.get("/group/writing", groupWriting);
router.get("/group/comment", addComments);

// Pet memorials 
router.post("/createPetMemorial", createPetMemorial);

export default router;
