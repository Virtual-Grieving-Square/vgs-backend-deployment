import express from 'express';
import multer from "multer";
import {
  addFlower,
  getFlowers,
  getImage
} from '../controller/flower';

const router = express.Router();

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

router.get("/getAll", getFlowers);
router.post('/create', upload.single("image"), addFlower);

// Images
router.get("/getImage", getImage);

export default router; 