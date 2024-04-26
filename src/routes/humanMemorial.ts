import express from "express";
import {
  createHumanMemorial,
  fetchHumanMemorial,
  getImages,
} from "../controller/humanMemorial";
import multer from "multer";
import { removeSpaces } from "../util/removeSpace";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/image/Memorial/HumanMemorial");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + removeSpaces(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.post(
  "/createHumanMemrial",
  upload.array("photos"),
  createHumanMemorial
);
router.get("/fetchHumanMemorial", fetchHumanMemorial);
router.get("/getImageHuman", getImages);

export default router;
