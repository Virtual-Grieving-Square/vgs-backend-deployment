import express from 'express';
import { getRecentObituaries } from '../controller/obituaries';

const router = express.Router();

router.get("/getRecentObituaries", getRecentObituaries);

export default router;
