import { Recoverable } from "repl";
import {
  changePassword,
  login,
  requestPasswordReset,
  resetPassword,
  sendOTP,
  signInWithGoogle,
  signup,
  verify,
  verifyOTP,
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

import { getDetails, uploadProfileImage } from "../controller/user/user";
import { contactUs } from "../controller/user/contactus";
import { addSubscription, handleStripeWebhook } from "../controller/user/subscription";
import { startStreaming, stopStreamin, streamingStatus } from "../controller/user/streaming";

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
});

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

// Reset Password
router.put('/forgot-password/sendOtp', sendOTP);
router.put('/forgot-password/verifyOtp', verifyOTP);
router.put('/forgot-password/resetPassword', changePassword);


router.post("/resetPassword", resetPassword);
router.post("/recoverPassword", requestPasswordReset);

// Signin with Google
router.post('/google', signInWithGoogle);

// User
router.get("/getDetails/:id", getDetails);
router.post(
  "/uploadProfileImage",
  uploadProfile.array("photo"),
  uploadProfileImage
);

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

// contact page API

router.post("/contactus", contactUs);

// price and subscription payment API
router.post("addSubscription", addSubscription);
router.post("/webhooks/stripe", handleStripeWebhook);

// live streaming 
router.post("startStreamin", startStreaming);
router.post("addSubscription/:broadcastId", stopStreamin);
router.post("addSubscription/:broadcastId", streamingStatus);

export default router;
