import { Request, Response } from "express";

// Model
import TombstoneModel from "../model/tombstone";
import UsersTombstoneModel from "../model/usersTombstone";

// Util
import { removeSpaces } from "../util/removeSpace";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../util/awsAccess";
import { UserModel } from "../model/user";

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
    let user = await UserModel.findById(userId);
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
      description,
      image: fileName,
      type,
      userId,
      creator: user?.firstName + " " + user?.lastName,
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
