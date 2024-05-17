import express from 'express';
import { testSMS, verifySMS } from '../controller/test';

const router = express.Router();

router.get('/testSMS', testSMS);
router.post("/verifySms", verifySMS)

export default router;