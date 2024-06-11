import express from 'express';
import { subscribeEmail } from '../controller/email';

const router = express.Router();

router.post('/subscribe', subscribeEmail);


export default router;
