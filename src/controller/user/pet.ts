import { Request, Response } from "express";
import { PetMemorial } from "../../model/petMemorial";
import { checkCommentUsingSapling } from "../../util/commentFilter";
import { UserModel } from "../../model/user";

export const createPetMemorial = async (req: Request, res: Response) => {
  try {
    const { name, age, type, DOB, DOD, owner, coverImage } = req.body;

    if (!name || !age || !type || !DOB ||  !DOD || !owner || !coverImage) {
      return res
        .status(400)
        .json({ message: "All fields are required" });
    }

    const petMemorial = new PetMemorial({
        name,
        age,
        type,
        DOB,
        DOD,
        owner,
        coverImage
    });

    await petMemorial.save();

    res.status(201).json({ message: "Pet Memory created successfully", petMemorial });
  } catch (error) {
    console.error("Error creating pet memorials:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};