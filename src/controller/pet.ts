import { Request, Response } from "express";
import { PetMemorial } from "../model/petMemorial";
import { checkCommentUsingSapling } from "../util/commentFilter";
import { UserModel } from "../model/user";
import path from "path";

export const getAllPetMemorial = async (req: Request, res: Response) => {
  try {
    const allpetMemorials = await PetMemorial.find();
    res.status(200).json(allpetMemorials);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const createPetMemorial = async (req: Request, res: Response) => {
  try {
    const { name, age, type, DOB, DOD, owner } = req.body;

    if (req.files?.length === 0) {
      return res.status(406).json({ message: "No image provided" })
    } else {
      const coverImage = (req.files as Express.Multer.File[]).map(
        (file: Express.Multer.File) => ({
          url: file.path,
        })
      );

      if (!name || !age || !type || !DOB || !DOD || !owner) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const url = coverImage[0].url;
      const petMemorial = new PetMemorial({
        name: name,
        age: age,
        type: type,
        DOB: DOB,
        DOD: DOD,
        owner: owner,
        coverImage: url,
      });

      await petMemorial.save();

      res
        .status(201)
        .json({ message: "Pet Memory created successfully", petMemorial });
    }

  } catch (error) {
    console.error("Error creating pet memorials:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPetMemorialByUserId = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const pet = await PetMemorial.find({
      owner: id,
    });

    res.status(200).json(pet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const fetchpetImage = async (req: Request, res: Response) => {
  const image = req.query.name as string | undefined;

  if (!image) {
    return res.status(400).send("Image name is not provided");
  }

  try {
    const location = path.join(__dirname, "../../", image);

    res.sendFile(location);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pet memorial ", error });
  }
};
