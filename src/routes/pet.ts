import express from 'express';
import {
  createPetMemorial, fetchpetMemorial
} from '../controller/pet';
import multer from 'multer';
import { removeSpaces } from '../util/removeSpace';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/image/pet/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + removeSpaces(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.post("/create", upload.array("coverImage"),createPetMemorial);
router.get("/fetchPet", fetchpetMemorial);

export default router; 