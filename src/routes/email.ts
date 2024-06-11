import express from 'express';
import { Test, subscribeEmail } from '../controller/email';

const router = express.Router();

router.post('/subscribe', subscribeEmail);

// Test
router.get("/test", Test);
export default router;
