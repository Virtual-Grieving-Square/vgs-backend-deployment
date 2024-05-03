import { Request, Response } from "express";
import { UserModel } from "../model/user";
import path from "path";
import { removeSpaces } from "../util/removeSpace";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../util/awsAccess";

export const getAll = async (req: Request, res: Response) => {
  try {
    const users = await UserModel.find();
    res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateDetails = async (req: Request, res: Response) => {
  try {
    const { fname, lname, username } = req.body;
    console.log(req.body);
    const user = await UserModel.findByIdAndUpdate(req.params.id, {
      firstName: fname,
      lastName: lname,
      username: username,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const uploadProfileImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;

    // const photos = (req.files as Express.Multer.File[]).map(
    //   (file: Express.Multer.File) => ({
    //     url: file.path,
    //   })
    // );

    
    const fileOrgnName = req.file?.originalname || "";
    const fileName = `uploads/image/profileImage/${Date.now()}-${removeSpaces(
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

    const user = await UserModel.findByIdAndUpdate(id, {
      profileImage: fileName,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile image uploaded successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProfileImage = async (req: Request, res: Response) => {
  const image = req.query.name as string | undefined;

  if (!image) {
    return res.status(400).send("Image name is not provided");
  }
  try {
    const location = path.join(__dirname, "../../", image);

    res.sendFile(location);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProfileImagebyID = async (req: Request, res: Response) => {
  const ID = req.query.ID as string;

  if (!ID) {
    return res.status(400).send("Image name is not provided");
  }
  try {
    const userData = await UserModel.findById(ID);

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!userData.profileImage) {
      return res
        .status(404)
        .json({ message: "Profile image not found for the user" });
    }
    const image = userData.profileImage;
    const location = path.join(__dirname, "../../", image);

    res.sendFile(location);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
