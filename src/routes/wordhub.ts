import express from "express";
import { addWords } from "../controller/profanity";

const router = express.Router();

router.post("/addWords", addWords);

export default router;
