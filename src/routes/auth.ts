import express from 'express';

// Controller
import {
  changePassword,
  login,
  requestPasswordReset,
  resetPassword,
  sendOTP,
  signInWithGoogle,
  signup,
  verify,
  verifyOTP,
} from '../controller/user/auth';

const router = express.Router();

// Auth
router.post("/signup", signup);
router.post("/verify", verify);
router.post("/login", login);

// Reset Password
router.put('/forgot-password/sendOtp', sendOTP);
router.put('/forgot-password/verifyOtp', verifyOTP);
router.put('/forgot-password/resetPassword', changePassword);

// Signin with Google
router.post('/google', signInWithGoogle);

// Other
router.post("/resetPassword", resetPassword);
router.post("/recoverPassword", requestPasswordReset);

export default router;