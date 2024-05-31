import express from 'express';
import { addToWalletFunction, removeFromWalletFunction, updateWallet, wallet } from "../controller/wallet";

const router = express.Router();

router.post('/wallet', wallet);
router.put('/update', updateWallet);

// Add
router.post("/addToWallet", addToWalletFunction);
router.post("/removeFromWallet", removeFromWalletFunction);

export default router;
