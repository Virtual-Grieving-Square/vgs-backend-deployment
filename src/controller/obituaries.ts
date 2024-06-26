import { Request, Response } from "express";
import { HumanMemorial } from "../model/humanMemorial";
import FamousPeopleModel from "../model/famousPeople";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../util/awsAccess";
import { Stream } from "stream";

export const getRecentObituaries = async (req: any, res: Response) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

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

    const total = recentObituaries.length;

    res.status(200).json({
      total: total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(total / limit),
      obituaries: recentObituaries.slice(skip, skip + limit),
    });

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
