import express from 'express';
import { addToWalletFunction, getWallet, removeFromWalletFunction, updateWallet, wallet } from "../controller/wallet";

const router = express.Router();

router.get('/:id', wallet);
router.put('/update', updateWallet);
router.get("/getWallet/:id", getWallet);

// Add
router.post("/addToWallet", addToWalletFunction);
router.post("/removeFromWallet", removeFromWalletFunction);

export default router;
