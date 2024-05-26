import express from "express";
import multer from "multer";

// Controller
import {
  getAll,
  getDetails,
  getProfileImage,
  getProfileImagebyID,
  updateCoverImage,
  updateDetails,
  uploadProfileImage
} from "../controller/user";

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const router = express.Router();

// User
// Get
router.get("/getAll", getAll);
router.get("/getDetails/:id", getDetails);

// Update
router.put('/update/:id', updateDetails);
router.post("/uploadProfileImage/:id", upload.single("image"), uploadProfileImage);
router.post("/updateCoverImage/:id", upload.single("image"), updateCoverImage);

// Get Image
router.get('/getImage', getProfileImage);
router.get('/getImageById', getProfileImagebyID);

export default router;
