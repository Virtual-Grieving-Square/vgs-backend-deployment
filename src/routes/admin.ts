import express from 'express';
import { login, signup, viewAll } from '../controller/admin';
import { getFeePercentage, setFeePercentage } from '../controller/Admin/FeePercentage';

const router = express.Router();

router.get("/", viewAll);
router.post("/", signup);
router.post('/login', login);

router.post("/admin/addFee", setFeePercentage);
router.post("/admin/getFee", getFeePercentage);
export default router;