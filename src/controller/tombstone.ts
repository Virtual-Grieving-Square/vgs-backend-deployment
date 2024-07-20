import { Request, Response } from "express";

// Model
import TombstoneModel from "../model/tombstone";
import UsersTombstoneModel from "../model/usersTombstone";

// Util
import { removeSpaces } from "../util/removeSpace";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../util/awsAccess";
import { UserModel } from "../model/user";
import { AdminModel } from "../model/admin";
import PetTombstoneModel from "../model/petTombstone";

export const getAll = async (req: Request, res: Response) => {
  try {
    const tombstones = await TombstoneModel.find();

    res.status(200).json(tombstones);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const tombstone = await TombstoneModel.findById(id);

    if (!tombstone) {
      return res.status(404).json({ message: "Tombstone not found" });
    }

    res.status(200).json(tombstone);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
export const create = async (req: Request, res: Response) => {
  try {
    const { name, description, type, userId } = req.body;

    const fileOrgnName = req.file?.originalname || "";
    const fileName = `uploads/image/tombstone/${Date.now()}-${removeSpaces(
      fileOrgnName
    )}`;
    if (type == "admin") {
      let admins = await AdminModel.findById(userId);
      const modfied = Array.isArray(description)
        ? description.join(", ")
        : description;
      if (!admins) {
        return res.status(404).send("Admin not found");
      }
      // Upload file to S3
      const uploadParams = {
        Bucket: "vgs-upload",
        Key: fileName,
        Body: req.file?.buffer,
        ContentType: req.file?.mimetype,
      };

      const command = new PutObjectCommand(uploadParams);
      await s3Client.send(command);

      const tombstone = await TombstoneModel.create({
        name,
        description: modfied,
        image: fileName,
        type,
        userId,
        creator: `${admins.fname} ${admins.lname}`,
      });

      res.status(200).json({
        tombstone: tombstone,
        message: "Tombstone created successfully",
      });
    } else if (type == "user") {
      let user = await UserModel.findById(userId);
      const modfied = Array.isArray(description)
        ? description.join(", ")
        : description;
      // Upload file to S3
      const uploadParams = {
        Bucket: "vgs-upload",
        Key: fileName,
        Body: req.file?.buffer,
        ContentType: req.file?.mimetype,
      };

      const command = new PutObjectCommand(uploadParams);
      await s3Client.send(command);

      const tombstone = await TombstoneModel.create({
        name,
        description: modfied,
        image: fileName,
        type,
        userId,
        creator: user?.firstName + " " + user?.lastName,
      });

      res.status(200).json({
        tombstone: tombstone,
        message: "Tombstone created successfully",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

export const usersTombstone = async (req: Request, res: Response) => {
  try {
    const { userId, name, description } = req.body;

    const fileOrgnName = req.file?.originalname || "";
    const fileName = `uploads/image/tombstone/users/${Date.now()}-${removeSpaces(
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

    const tombstone = await UsersTombstoneModel.create({
      userId,
      name,
      description,
      image: fileName,
    });

    res.status(200).json({
      tombstone: tombstone,
      message: "Tombstone created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

export const petTombstone = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      name,
      description,

      namePostion,
      descPostion,
      imagePostion,
      datePostion,
    } = req.body;
    const fileOrgnName = req.file?.originalname || "";
    const fileName = `uploads/image/tombstone/pet/${Date.now()}-${removeSpaces(
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

    const namePostionStr = JSON.stringify(namePostion);
    const descPostionStr = JSON.stringify(descPostion);
    const imagePostionStr = JSON.stringify(imagePostion);
    const datePostionStr = JSON.stringify(datePostion);

    const tombstone = await PetTombstoneModel.create({
      userId,
      name,
      description,
      image: fileName,
      namePostion: namePostionStr,
      descPostion: descPostionStr,
      imagePostion: imagePostionStr,
      datePostion: datePostionStr,
    });

    res.status(200).json({
      tombstone: tombstone,
      message: "Tombstone created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

export const getPetTombstone = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tombstone = await PetTombstoneModel.findById(id);

    if (!tombstone) {
      return res.status(404).send("Tombstone not found");
    }

    const namePostion = JSON.parse(tombstone.namePostion);
    const descPostion = JSON.parse(tombstone.descPostion);
    const imagePostion = JSON.parse(tombstone.imagePostion);
    const datePostion = JSON.parse(tombstone.datePostion);

    const name2 = JSON.parse(namePostion);

    res.status(200).json({
      ...tombstone.toObject(),
      name2,
      descPostion,
      imagePostion,
      datePostion,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// Fetching all pet tombstons boi
export const getAllPetTombstones = async (req: Request, res: Response) => {
  try {
    const tombstones = await PetTombstoneModel.find();

    const parsedTombstones = tombstones.map((tombstone) => {
      const parsedTombstone = tombstone.toObject();
      parsedTombstone.namePostion = JSON.parse(
        JSON.parse(tombstone.namePostion)
      );
      parsedTombstone.descPostion = JSON.parse(
        JSON.parse(tombstone.descPostion)
      );
      parsedTombstone.imagePostion = JSON.parse(
        JSON.parse(tombstone.imagePostion)
      );
      parsedTombstone.datePostion = JSON.parse(
        JSON.parse(tombstone.datePostion)
      );
      return parsedTombstone;
    });
    console.log(parsedTombstones);
    res.status(200).json(parsedTombstones);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
export const fetchUsersTombstone = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const tombstone = await UsersTombstoneModel.find({ userId: userId });

    if (!tombstone) {
      return res.status(404).json({ message: "Tombstone not found" });
    }

    res.status(200).json(tombstone);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
export const deleteTombstone = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log("Here");

    await TombstoneModel.findByIdAndDelete(id);

    res.status(200).json({ message: "Tombstone deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

export const deletePetTombstone = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log("Here");

    await TombstoneModel.findByIdAndDelete(id);

    res.status(200).json({ message: "Tombstone deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
