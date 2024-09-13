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
  updateHeroesNote,
  createHeroesComment,
  countHeroComment,
  getAllHeroComments,
  translateHeroComment,
  likeHeroComment,
  searchHeroMemorial,
  deleteHeroComment,
  updateHeroTombstone,
} from "../controller/Heroes.controller";

import multer from "multer";
import { checkUserStatus } from "../middleware/userStatus";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/create", upload.single("image"), createHero);


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
router.post("/updateNote", updateHeroesNote);
router.post("/updateTombstone", updateHeroTombstone);


// Comment
router.post("/comment/add", checkUserStatus, createHeroesComment);
router.get("/count/:id", countHeroComment);
router.get("/comment/:id", getAllHeroComments);
router.post("/translate", translateHeroComment);
router.post("/likeComment", likeHeroComment);

// Search
router.get("/search", searchHeroMemorial);

//delete
router.delete("/delete/:id", deleteHero);
router.delete("/delete/comment/:id", deleteHeroComment);

export default router;
