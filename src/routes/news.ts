import express from "express";
import { getNews, getRecent3News, updateNews } from "../controller/news";

const router = express.Router();

router.get("/getNews", getNews);
router.get("/getRecent3News", getRecent3News);
router.get("/updateNews", updateNews);

export default router;
