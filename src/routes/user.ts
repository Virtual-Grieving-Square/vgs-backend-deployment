import express from "express";
import multer from "multer";

// Controller
import {
  getAll,
  getDetails,
  getProfileImage,
  getProfileImagebyID,
  updateDetails,
  uploadProfileImage
} from "../controller/user";

// Multer
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/image/profileImage/");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

const storage = multer.memoryStorage()
const upload = multer({storage: storage})


// const upload = multer({ storage: storage });

const router = express.Router();

// User
router.get("/getAll", getAll);
router.get("/getDetails/:id", getDetails);
router.put('/update/:id', updateDetails);
router.post("/uploadProfileImage", upload.single("image"), uploadProfileImage);
router.get('/getImage', getProfileImage);
router.get('/getImageById', getProfileImagebyID);

export default router;
