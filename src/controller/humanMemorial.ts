import e, { Request, Response } from "express";
import { HumanMemorial } from "../model/humanMemorial";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../util/awsAccess";
import { removeSpaces } from "../util/removeSpace";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Stream } from "stream";
import { Memorial } from "../model/memorial";
import { MemorialComment } from "../model/memorialComment";
import { checkCommentUsingBadwords } from "../util/commentFilter";
import { UserModel } from "../model/user";
import Filter from "bad-words";
import config from "../config";
import axios from "axios";

const filter = new Filter();

export const getAllHumanMemorial = async (req: any, res: Response) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;


    const allhumanMemorials = await HumanMemorial.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await HumanMemorial.countDocuments();

    res.status(200).json({
      total: total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(total / limit),
      memorials: allhumanMemorials
    });

  } catch (error) {
    res.status(500).json({ message: "error fetching pet memorial ", error });
  }
};

export const getHumanMemorialById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const humanMemorial = await HumanMemorial.findById(id);

    if (!humanMemorial) {
      return res.status(408).json({ message: "Memorial not found" });
    }

    res.status(200).json(humanMemorial);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createHumanMemorial = async (req: Request, res: Response) => {
  try {
    const { name, age, description, dob, dod, author, relation, memorialNote, tombstone } = req.body;
    console.log(req.body);
    console.log(req.files);

    if (req.files?.length === 0) {
      return res.status(406).json({ message: "No image provided" });
    } else {
      // const coverImage = (req.files as Express.Multer.File[]).map(
      //   (file: Express.Multer.File) => ({
      //     url: file.path,
      //   })
      // );

      const fileOrgnName = req.file?.originalname || "";
      const fileName = `uploads/image/human/${Date.now()}-${removeSpaces(fileOrgnName)}`;

      // Upload file to S3
      const uploadParams = {
        Bucket: "vgs-upload",
        Key: fileName,
        Body: req.file?.buffer,
        ContentType: req.file?.mimetype,
      };

      const command = new PutObjectCommand(uploadParams);
      await s3Client.send(command);

      if (!name || !age || !description || !dob || !dod || !author) {
        return res.status(402).json({ message: "All fields are required" });
      }
      // const url = coverImage[0].url;

      if (tombstone == "true") {
        const humanMemorial = new HumanMemorial({
          name: name,
          age: age,
          description: description,
          dob: dob,
          dod: dod,
          author: author,
          image: fileName,
          memorialNote: memorialNote,
          relation: relation,
          tombstone: true,
          tombstoneId: req.body.tombstoneId,
        });

        await humanMemorial.save();

        res
          .status(200)
          .json({ message: "Human Memory created successfully", humanMemorial });
      } else {
        const humanMemorial = new HumanMemorial({
          name: name,
          age: age,
          description: description,
          dob: dob,
          dod: dod,
          author: author,
          memorialNote: memorialNote,
          image: fileName,
          relation: relation,
        });

        await humanMemorial.save();

        res
          .status(200)
          .json({ message: "Human Memory created successfully", humanMemorial });
      }

    }
  } catch (error) {
    console.error("Error Human Memorial:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMemorialByUserId = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const humanMemorial = await HumanMemorial.find({
      author: id,
    }).sort({ createdAt: -1 });

    if (!humanMemorial) {
      return res.status(404).json({ message: "Memorial not found" });
    }

    res.status(200).json(humanMemorial);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getImage = async (req: Request, res: Response) => {
  try {
    const name = req.query.name as string | "";

    if (!name) {
      return res.status(403).send("Image name is not provided");
    }


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
    res.status(500).json({ message: "Error fetching pet memorial ", error });
  }
};

export const getObituaries = async (req: Request, res: Response) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const obituaries = await HumanMemorial.find({ dod: { $lt: sixMonthsAgo } });

    res.status(200).json(obituaries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const searchHumanMemorial = async (req: Request, res: Response) => {
  try {
    const [search] = Object.values(req.query);
    const humanMemorial = await HumanMemorial.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        // { description: { $regex: search, $options: "i" } },
      ],
    });

    if (humanMemorial.length === 0) {
      return res.status(404).json({ message: "Memorial not found" });
    }

    res.status(200).json(humanMemorial);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteHumanMemorial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const humanMemorial = await HumanMemorial.findById(id);

    if (!humanMemorial) {
      return res.status(404).json({ message: "Memorial not found" });
    }

    await HumanMemorial.findByIdAndDelete(id);

    res.status(200).json({ message: "Memorial deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const updateHumanMemorial = async (req: any, res: Response) => {
  try {
    const { id, name, description, dob, dod, author } = req.body;
    if (req.files?.length === 0) {
      const humanMemorial = await HumanMemorial.findById(id);
      if (!humanMemorial) {
        return res.status(404).json({ message: "Memorial not found" });
      } else {
        if (
          name == humanMemorial.name &&
          description == humanMemorial.description &&
          dob == humanMemorial.dob
        ) {
          return res.status(402).json({ message: "No changes made" });
        } else {
          await HumanMemorial.findByIdAndUpdate(id, {
            name: name,
            description: description,
            dob: dob,
            dod: dod,
          });
          res.status(200).json({ msg: "Memorial Updated" });
        }
      }
    } else {
      const fileOrgnName = req.file?.originalname || "";
      const fileName = `uploads/image/human/${Date.now()}-${removeSpaces(fileOrgnName)}`;

      // Upload file to S3
      const uploadParams = {
        Bucket: "vgs-upload",
        Key: fileName,
        Body: req.file?.buffer,
        ContentType: req.file?.mimetype,
      };

      const command = new PutObjectCommand(uploadParams);
      await s3Client.send(command);

      await HumanMemorial.findByIdAndUpdate(id, {
        name: name,
        description: description,
        dob: dob,
        dod: dod,
        image: fileName,
      });

      res.status(200).json({ msg: "Memorial Updated" });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const countMemorialComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const Mem: any = await Memorial.find({
      _id: id,
    });

    res.status(200).json({ comment: Mem[0].comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const createMemorialComment = async (req: Request, res: Response) => {
  try {
    const { content, memorialId, userId } = req.body;

    const memorial = await HumanMemorial.findById(memorialId);

    if (!content || !memorialId || !userId) {
      return res.status(400).json({ error: "content and userId are required" });
    }
    const comment = new MemorialComment({
      authorId: memorial!.author,
      comment: content,
      memorialId: memorialId,
      userId: userId,
    });

    // Check if the comment contains bad words from library
    const response: any = filter.isProfane(content);
    const response2: any = await checkCommentUsingBadwords(content);

    let user = await UserModel.findById(userId);

    if (user) {
      var strike = user.blacklistCount;
      console.log("Strike", strike);

      if (filter.isProfane(content) || response2) {
        try {
          if (strike < 2) {
            user.blacklistCount += 1;
            await user.save();
            return res
              .status(402)
              .json({
                error: "Inappropriate comment detected",
                msg: "inappropriate_comment_detected",
                banMessage: "Inappropriate comment detected"
              });
          } else {
            user.blacklistCount += 1;
            user.banCount += 1;

            let now = new Date();
            let banPeriod = 24 * 60 * 60 * 1000; // 24 hours

            if (user.banCount == 2) {
              banPeriod = 48 * 60 * 60 * 1000; // 48 hours
            } else if (user.banCount > 2) {
              banPeriod = 48 * 60 * 60 * 1000; // 48 hours
              user.flag = "BAN";
            }

            user.flag = user.banCount > 2 ? "BAN" : "suspended";
            user.banExpiry = new Date(now.getTime() + banPeriod);
            await user.save();

            let banMessage =
              user.banCount > 2
                ? "Inappropriate comment detected and account banned. You can't comment anymore"
                : `Inappropriate comment detected and account suspended for ${banPeriod / (60 * 60 * 1000)
                } Hr`;

            return res.status(402).json({
              error: banMessage,
              banMessage: banMessage,
              msg: user.banCount > 2 ? "account_banned" : "account_suspended"
            });
          }
        } catch (error) {
          console.error("Error updating user blacklist count:", error);
        }
      }

      if (strike > 2) {
        return res.status(402).json({
          error: "Account Suspended",
          msg: "account_suspended",
          banMessage: "Account Suspended for Bad Comment",
        });
      } else {
        await comment.save();
        await Memorial.findByIdAndUpdate(memorialId, { $inc: { comments: 1 } });
        res
          .status(200)
          .json({
            msg: "comment_created_successfully",
            message: "Comment created successfully",
            comment
          });
      }
    }
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const translateMemoComment = async (req: Request, res: Response) => {
  const text = req.body.text;
  const targetLanguage: string = "en";

  const apiKey = config.Google_translate;

  const apiUrl: string = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}&q=${encodeURIComponent(
    text
  )}&target=${targetLanguage}`;

  await axios
    .post(apiUrl)
    .then((response) => {
      res.status(200).json({
        translate: response.data.data.translations[0].translatedText,
        lan: "eng",
      });
    })
    .catch((error) => {
      console.error("Error:", error);
      res.status(403).json({
        error,
      });
    });
};

export const getAllMemorialComments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const comments = await MemorialComment.find({
      _id: id,
    });

    res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};