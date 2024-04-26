import express from "express";
import {
  createHumanMemorial,
  fetchHumanMemorial,
  fetchMemorialsById,
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
  upload.array("image"),
  createHumanMemorial
);
router.get("/getAll", fetchHumanMemorial);
router.get("/fetchMemorial/:id", fetchMemorialsById);
router.get("/getImage/:name", getImages);

export default router;
