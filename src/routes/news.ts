import express from 'express';
import { getNews, getRecent3News } from '../controller/news';

const router = express.Router();

router.get('/getNews', getNews);
router.get("/getRecent3News", getRecent3News);


export default router; 