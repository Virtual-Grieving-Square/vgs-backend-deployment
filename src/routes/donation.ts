import express from 'express';
import { donationHistory, makeDonation } from '../controller/donation';

const router = express.Router();

router.post('/makeDonation', makeDonation);
router.post('/fetchDonation', donationHistory);


export default router;