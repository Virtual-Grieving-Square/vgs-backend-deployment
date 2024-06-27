import express from 'express';
import {
  claimFlowerDonation,
  claimMoneyDonation,
  claimOTP,
  donateFlower,
  donationHistory,
  fetchComments,
  fetchDonors,
  flowerDonationHistory,
  getAll,
  getDonationByUserId,
  makeDonation,
  makeDonationNonUser,
  verifyOTP,
} from '../controller/donation';

const router = express.Router();

router.post('/makeDonation', makeDonation);
router.post("/makeDonation/non-user", makeDonationNonUser)
router.post('/donateFlower', donateFlower);
router.post('/fetchDonation', donationHistory);
router.get('/donationHistory/:id', donationHistory);
router.get('/flowerDonationHistory/:id', flowerDonationHistory);

// Get Donations
router.get("/getAll", getAll);
router.get("/getDonationByUserId/:id", getDonationByUserId);
router.get("/donors/:id", fetchDonors);

// Claim
router.post("/claim/money", claimMoneyDonation);
router.post("/claim/flower", claimFlowerDonation);

// Claim Verification
router.post("/claim/otp", claimOTP);
router.post("/claim/verifyOtp", verifyOTP);

// Comments
router.get("/comments/:id", fetchComments);




export default router;