import express from 'express';
import { addStripeAccount } from '../controller/stripe';

const router = express.Router();

router.get('/addStripeAccount', addStripeAccount);

export default router; 