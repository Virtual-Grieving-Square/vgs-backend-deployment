import express from 'express';
import {
  donateFlower,
  donationHistory,
  flowerDonationHistory,
  getAll,
  getDonationByUserId,
  makeDonation,
} from '../controller/donation';

const router = express.Router();

router.post('/makeDonation', makeDonation);
router.post('/donateFlower', donateFlower);
router.post('/fetchDonation', donationHistory);
router.get('/donationHistory/:id', donationHistory);
router.get('/flowerDonationHistory/:id', flowerDonationHistory);

// Get Donations
router.get("/getAll", getAll);
router.get("/getDonationByUserId/:id", getDonationByUserId);


export default router;