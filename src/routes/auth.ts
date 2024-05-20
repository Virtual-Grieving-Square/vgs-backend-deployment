import express from 'express';

// Controller
import {
  changePassword,
  checkGoogleSignin,
  checkUser,
  login,
  requestPasswordReset,
  resetPassword,
  sendOTP,
  signInWithGoogle,
  signup,
  verify,
  verifyOTP,
} from '../controller/auth';

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
router.get("/google/check/:email", checkGoogleSignin);
router.post('/google', signInWithGoogle);

// Other
router.post("/resetPassword", resetPassword);
router.post("/recoverPassword", requestPasswordReset);

// CheckUser 
router.get('/checkUser/:id', checkUser);

export default router;