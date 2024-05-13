import express from 'express';
import { getObsImage, getRecentObituaries } from '../controller/obituaries';

const router = express.Router();

router.get("/getRecentObituaries", getRecentObituaries);
router.get("/getObituImage", getObsImage)

export default router;
