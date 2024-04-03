import express from "express";
import {
  createHumanMemorial,
  fetchHumanMemorial,
} from "../controller/humanMemorial";
import multer from "multer";
import { removeSpaces } from "../util/removeSpace";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/image/human/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + removeSpaces(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.post(
  "/createHumanMemrial",
  upload.array("coverImage"),
  createHumanMemorial
);
router.get("/fetchHumanMemorial", fetchHumanMemorial);

export default router;
