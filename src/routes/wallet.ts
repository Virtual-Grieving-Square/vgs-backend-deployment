import express from 'express';
import { updateWallet, wallet } from "../controller/wallet";

const router = express.Router();

router.post('/wallet', wallet);
router.put('/update', updateWallet);

export default router;
