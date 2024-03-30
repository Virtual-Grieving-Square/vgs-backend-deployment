import express from "express";
import multer from "multer";

// Controller
import {
  getDetails,
  uploadProfileImage
} from "../controller/user/user";

// Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/image/profileImage");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});


const upload = multer({ storage: storage });

const router = express.Router();

// User
router.get("/getDetails/:id", getDetails);

// Update Profile 
router.post("/uploadProfileImage", upload.array("photo"), uploadProfileImage);





export default router;
