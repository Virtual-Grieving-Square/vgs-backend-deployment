import { Request, Response } from "express";
import { HumanMemorial } from "../model/humanMemorial";
import FamousPeopleModel from "../model/famousPeople";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../util/awsAccess";
import { Stream } from "stream";

export const getRecentObituaries = async (req: Request, res: Response) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const humanObituaries = await HumanMemorial.aggregate([
      {
        $match: {
          dod: { $gte: sixMonthsAgo },
        },
      },
    ]);

    const famousObituaries = await FamousPeopleModel.aggregate([
      {
        $match: {
          dod: { $gte: sixMonthsAgo },
        },
      },
    ]);

    const recentObituaries = [...humanObituaries, ...famousObituaries];

    res.status(200).json(recentObituaries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getObsImage = async (req: Request, res: Response) => {
  try {
    const name = req.query.image as string | undefined;

    if (!name) {
      return res.status(400).send("Image name is not provided");
    }

    const key = name;

    const command = new GetObjectCommand({
      Bucket: "vgs-upload",
      Key: name,
    });

    const { Body } = await s3Client.send(command);

    if (Body instanceof Stream) {
      res.set({
        "Content-Type": "image/jpg",
      });

      Body.pipe(res);
    } else {
      res.status(500).json({ error: "Failed to fetch image from S3" });
    }
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Failed to get the signed URL" });
  }
};
