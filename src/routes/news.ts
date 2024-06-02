import express from 'express';
import { getNews } from '../controller/news';

const router = express.Router();

router.get('/getNews', getNews);

export default router; 