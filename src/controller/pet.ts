import { Request, Response } from "express";
import { PetMemorial } from "../model/petMemorial";
import { checkCommentUsingSapling } from "../util/commentFilter";
import { UserModel } from "../model/user";
import path from "path";
import { removeSpaces } from "../util/removeSpace";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../util/awsAccess";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Stream } from "stream";

export const getAllPetMemorial = async (req: Request, res: Response) => {
  try {
    const allpetMemorials = await PetMemorial.find();
    res.status(200).json(allpetMemorials);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPetById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const pet = await PetMemorial.findById(id);
    res.status(200).json(pet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const createPetMemorial = async (req: Request, res: Response) => {
  try {
    const { name, age, type, dob, dod, author } = req.body;
    const owner = author;
    console.log(req.files);
    console.log(req.body);

    if (req.files?.length === 0) {
      return res.status(406).json({ message: "No image provided" });
    } else {
      // const coverImage = (req.files as Express.Multer.File[]).map(
      //   (file: Express.Multer.File) => ({
      //     url: file.path,
      //   })
      // );
      const fileOrgnName = req.file?.originalname || "";
      const fileName = `uploads/image/Memorial/PetMemorial/${Date.now()}-${removeSpaces(
        fileOrgnName
      )}`;


      // Upload file to S3
      const uploadParams = {
        Bucket: "vgs-upload",
        Key: fileName,
        Body: req.file?.buffer,
        ContentType: req.file?.mimetype,
      };

      const command = new PutObjectCommand(uploadParams);
      await s3Client.send(command);

      if (!name || !age || !type || !dob || !dod || !owner) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // const url = coverImage[0].url;
      const petMemorial = new PetMemorial({
        name: name,
        age: age,
        type: type,
        DOB: dob,
        DOD: dod,
        owner: owner,
        coverImage: fileName,
      });

      await petMemorial.save();

      res
        .status(200)
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
};

export const fetchpetImage = async (req: Request, res: Response) => {
  try {
    const name = req.query.name as string | undefined;

    if (!name) {
      return res.status(400).send("Image name is not provided");
    }

    const key = `${name}`;

    const command = new GetObjectCommand({
      Bucket: "vgs-upload",
      Key: name,
    });

    const { Body } = await s3Client.send(command);

    if (Body instanceof Stream) {
      // res.set({
      //   "Content-Type": "image/*",
      // });

      Body.pipe(res);
    } else {
      res.status(500).json({ error: "Failed to fetch image from S3" });
    }
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Failed to get the signed URL" });
  }
};