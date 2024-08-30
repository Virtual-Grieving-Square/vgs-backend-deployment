import express from 'express';
import {
  changePassword,
  deleteAdmin,
  forgetPasswordOtp,
  forgetPasswordVerify,
  login,
  signup,
  suspendAdmin,
  viewAll
} from '../controller/admin';
import {
  getFeePercentage,
  setFeePercentage
} from '../controller/Admin/FeePercentage';

const router = express.Router();

router.get('/', viewAll);
router.post('/', signup);
router.post('/login', login);
router.delete('/:id', deleteAdmin);
router.put('/suspend', suspendAdmin);

router.post('/admin/addFee', setFeePercentage);
router.post('/admin/getFee', getFeePercentage);

router.post('/forgetpass-Otp', forgetPasswordOtp);
router.post('/forgetpass-verify', forgetPasswordVerify);
router.post('/forgetpass-change', changePassword );

export default router;