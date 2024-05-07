import express from 'express';
import { testSMS } from '../controller/test';

const router = express.Router();

router.get('/testSMS', testSMS);

export default router;