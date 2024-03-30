import express from 'express';
import multer from "multer";

//  Controller
import {
  addComments,
  addGroupMembers,
  createGallery,
  createGroup,
  getGalleryByGroupId,
  groupWriting,
} from '../controller/user/group';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/image/post");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

const router = express.Router();

// Interactive Group
router.post("/createGroup", createGroup);
router.post("/addGroupMember", addGroupMembers);
router.post("/addGallery", upload.array("photos"), createGallery);
router.get("/gallery/:groupId", getGalleryByGroupId);
router.get("/group/writing", groupWriting);
router.get("/group/comment", addComments);

export default router; 