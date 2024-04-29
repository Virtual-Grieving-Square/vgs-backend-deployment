import express from "express";

// Human Memorial
import {
  createHumanMemorial,
  getAllHumanMemorial,
  getMemorialByUserId,
  getImage,
  getObituaries,
  getHumanMemorialById,
} from "../controller/humanMemorial";
// Pet Memorial

import {
  getAllPetMemorial,
  createPetMemorial,
  fetchpetImage,
  getPetMemorialByUserId,
} from "../controller/pet";

import multer from "multer";
import { removeSpaces } from "../util/removeSpace";

const router = express.Router();


// Human Memorial Upload
const HumanMemorialStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/image/Memorial/HumanMemorial");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + removeSpaces(file.originalname));
  },
});

// Pet Memorial Upload
const PetMemorialStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/image/Memorial/PetMemorial");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + removeSpaces(file.originalname));
  },
});


const humanMemorialUpload = multer({ storage: HumanMemorialStorage });
const paetMemorialUpload = multer({ storage: PetMemorialStorage });


// Human Memorial
router.get("/human/getAll", getAllHumanMemorial);
router.post("/human/create", humanMemorialUpload.array("image"), createHumanMemorial);
router.get("/human/get/userId/:id", getMemorialByUserId);
router.get("/human/getById/:id", getHumanMemorialById);
router.get("/human/getImage", getImage);

// Pet Memorial
router.get('/pet/getAll', getAllPetMemorial);
router.post("/pet/create", paetMemorialUpload.array("image"), createPetMemorial);
router.get("/pet/get/userId/:id", getPetMemorialByUserId);
router.get("/pet/getImage", fetchpetImage);

// Get Obituaries 
router.get("/obituaries", getObituaries);


export default router;
