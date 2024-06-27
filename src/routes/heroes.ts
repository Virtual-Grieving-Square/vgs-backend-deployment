import express from "express";

import {
  createHero,
  getAllHeroes,
  getHeroByUserId,
  getImage,
  getHeroById,
  searcHeroMemorial,
  deleteHero,
  updateHero,
  getUserByHeroId,
} from "../controller/Heroes.controller";

import multer from "multer";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.post("/create", upload.single("image"), createHero);

router.delete("/delete/:id", deleteHero);

// Get
router.get("/getAll", getAllHeroes);
router.get("/get/userId/:id", getHeroByUserId);
router.get("/getById/:id", getHeroById);
router.get("/getUserByHeroId/:id", getUserByHeroId);

// Get Image
router.get("/getImage", getImage);

// Search
router.get("/search", searcHeroMemorial);

// Update
router.post("/update", upload.single("image"), updateHero);


export default router;
