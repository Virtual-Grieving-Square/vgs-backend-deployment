import express from "express";
import {
  createHumanMemorial,
  getAllHumanMemorial,
} from "../controller/humanMemorial";
import multer from "multer";
import { removeSpaces } from "../util/removeSpace";

const router = express.Router();

const storage = multer.memoryStorage()
const upload = multer({storage: storage})

router.post(
  "/createHumanMemrial",
  upload.single("coverImage"),
  createHumanMemorial
);
router.get("/fetchHumanMemorial", getAllHumanMemorial);

export default router;
