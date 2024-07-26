import express from 'express';
import multer from "multer";
import {
  addFlower,
  deleteFlower,
  getFlowers,
  getImage,
  update,
  updateFlower,
  getById,
} from '../controller/flower';
import { checkAdminState } from '../middleware/adminState';

const router = express.Router();

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

router.get("/getAll", getFlowers);
router.get("/getById/:id", getById);
router.post('/create', upload.single("image"), addFlower);
router.delete("/delete/:id", deleteFlower);

// Images
router.get("/getImage", getImage);

// Update
router.post("/updateFlowerImage", upload.single("image"), updateFlower);
router.put("/update", checkAdminState, update);

export default router; 