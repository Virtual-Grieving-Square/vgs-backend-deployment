import { Request, Response } from "express";
import PostModel, { IPost } from "../model/Post";
import { UserModel } from "../model/user";
import ReactionModel from "../model/reaction";
import CommentModel from "../model/comment";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { Stream } from "stream";
import config from "../config";

import { checkCommentUsingBadwords } from "../util/commentFilter";

import Filter from "bad-words";
import LikeModel from "../model/like";
import axios from "axios";
import { s3Client } from "../util/awsAccess";
import { removeSpaces } from "../util/removeSpace";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import {
  checkuserStorageLimit,
  getUserStorage,
  updateUserStorageOnPost,
  restoreStoragePost,
} from "../util/storageTracker";

// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const filter = new Filter();

export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, content, userId } = req.body;
    // Validate request data
    if (!title || !content || !userId) {
      return res
        .status(400)
        .json({ error: "Title, content, and userId are required" });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files were uploaded" });
    }

    const currentDate = new Date();
    const files = req.files as Express.Multer.File[];

    const photos = files.map((file) => {
      const fileOrgnName = file.originalname;
      const fileName = `uploads/image/post/${Date.now()}-${removeSpaces(
        fileOrgnName
      )}`;
      return { url: fileName };
    });

    const totalFileSize =
      files.reduce((acc, file) => acc + (file.size || 0), 0) / 1024 / 1024;

    const usersStorage = await getUserStorage(userId);

    console.log("total file size", totalFileSize);
    console.log("user left size", usersStorage);
    const { hasEnoughStorage, difference } = checkuserStorageLimit(
      usersStorage,
      totalFileSize
    );
    console.log("diffrence", difference);

    if (hasEnoughStorage) {
      const uploadPromises = files.map((file) => {
        const fileName = photos.find((photo) =>
          photo.url.includes(removeSpaces(file.originalname))
        )?.url;
        const uploadParams = {
          Bucket: "vgs-upload",
          Key: fileName || "",
          Body: file.buffer,
          ContentType: file.mimetype,
        };
        const command = new PutObjectCommand(uploadParams);
        return s3Client.send(command);
      });

      await Promise.all(uploadPromises);

      const post = new PostModel({
        title,
        content,
        createdAt: currentDate,
        reacts: 0,
        comments: 0,
        author: userId,
        photos,
      });

      // Save post to database
      await post.save();
      await updateUserStorageOnPost(userId, difference);

      res.status(200).json({ message: "Post created successfully", post });
    } else {
      res.status(500).json({ error: "Not enough Storage" });
    }
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const posts = await PostModel.find({
      author: id,
    }).sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAll = async (req: any, res: Response) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const posts = await PostModel.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await PostModel.countDocuments();

    res.status(200).json({
      total: total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(total / limit),
      posts: posts,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getRecent3Posts = async (req: Request, res: Response) => {
  try {
    const post = await PostModel.find();

    const posts = post.slice(0, 3);

    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const countLike = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const post: any = await PostModel.find({
      _id: id,
    });

    res.status(200).json({ likes: post[0].likes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const countComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const post: any = await PostModel.find({
      _id: id,
    });

    res.status(200).json({ comment: post[0].comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const checkLike = async (req: Request, res: Response) => {
  try {
    const { id, userId } = req.params;

    const likes = await LikeModel.find({
      postId: id,
      likerId: userId,
    });

    if (likes.length > 0) {
      return res.status(200).json({ liked: true });
    } else {
      return res.status(200).json({ liked: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const likePost = async (req: Request, res: Response) => {
  try {
    const { postId, likerId } = req.body;

    const likes = await LikeModel.find({
      postId: postId,
      likerId: likerId,
    });

    if (likes.length > 0) {
      await LikeModel.deleteMany({
        postId: postId,
        likerId: likerId,
      });

      await PostModel.findByIdAndUpdate(postId, { $inc: { likes: -1 } });

      return res
        .status(200)
        .json({ like: false, message: "Post unliked successfully" });
    } else {
      const like = new LikeModel({
        postId: postId,
        likerId: likerId,
      });

      await like.save();

      await PostModel.findByIdAndUpdate(postId, { $inc: { likes: 1 } });

      return res
        .status(200)
        .json({ like: true, message: "Post liked successfully" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const restoreStorage = await restoreStoragePost(postId);
    const deletedPost = await PostModel.findByIdAndDelete(postId);

    if (!deletedPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json({ message: "Post deleted successfully", deletedPost });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllComments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const comments = await CommentModel.find({
      postId: id,
    });

    res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createComment = async (req: Request, res: Response) => {
  try {
    const { authorId, content, postId, userId } = req.body;

    if (!authorId || !content || !postId || !userId) {
      return res.status(400).json({ error: "content and userId are required" });
    }
    const comment = new CommentModel({
      authorId: authorId,
      content: content,
      postId: postId,
      userId: userId,
    });

    // Check if the comment contains bad words from library
    const response: any = filter.isProfane(content);
    const response2: any = await checkCommentUsingBadwords(content);

    let user = await UserModel.findById(userId);

    // if (user) {
    //   var strike = user.blacklistCount;

    //   console.log("Strike", strike);
    //   // console.log(isCommentInappropriate)
    //   if (filter.isProfane(content) || response2) {
    //     try {
    //       if (strike < 2) {
    //         user.blacklistCount += 1;
    //         await user.save();
    //         return res
    //           .status(405)
    //           .json({ error: "Inappropriate comment detected" });
    //       } else if (strike === 2) {
    //         user.blacklistCount += 1;
    //         user.banCount += 1;
    //         if (user.banCount == 1) {
    //           // first timer
    //           let now = new Date();
    //           let expDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    //           user.flag = "suspended";
    //           user.banExpiry = expDate;
    //           await user.save();
    //           return res.status(400).json({
    //             error:
    //               "Inappropriate comment detected and account suspended for 24 Hr",
    //           });
    //         } else if (user.banCount == 2) {
    //           // second timer
    //           let now = new Date();
    //           let expDate = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    //           user.flag = "suspended";
    //           user.banExpiry = expDate;
    //           await user.save();
    //           return res.status(400).json({
    //             error:
    //               "Inappropriate comment detected and account suspended for 48 Hr",
    //           });
    //         } else if (user.banCount > 2) {
    //           // third timer
    //           let now = new Date();
    //           let expDate = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    //           user.flag = "BAN";
    //           user.banExpiry = expDate;
    //           await user.save();
    //           return res.status(400).json({
    //             error:
    //               "Inappropriate comment detected and account Ban you cant comment anymore",
    //           });
    //         }
    //       } else if (strike > 2) {
    //         return res.status(400).json({
    //           error: "Account Suspended",
    //         });
    //       }
    //     } catch (error) {
    //       console.error("Error updating user blacklist count:", error);
    //     }
    //   }

    //   if (strike > 2) {
    //     return res.status(400).json({
    //       error: "Account Suspended",
    //     });
    //   } else {
    //     await comment.save();
    //     await PostModel.findByIdAndUpdate(postId, { $inc: { comments: 1 } });

    //     res
    //       .status(200)
    //       .json({ message: "Comment created successfully", comment });
    //   }
    // }

    if (user) {
      var strike = user.blacklistCount;
      console.log("Strike", strike);

      if (filter.isProfane(content) || response2) {
        try {
          if (strike < 2) {
            user.blacklistCount += 1;
            await user.save();
            return res
              .status(405)
              .json({ error: "Inappropriate comment detected" });
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
                : `Inappropriate comment detected and account suspended for ${
                    banPeriod / (60 * 60 * 1000)
                  } Hr`;

            return res.status(400).json({ error: banMessage });
          }
        } catch (error) {
          console.error("Error updating user blacklist count:", error);
        }
      }

      if (strike > 2) {
        return res.status(400).json({ error: "Account Suspended" });
      } else {
        await comment.save();
        await PostModel.findByIdAndUpdate(postId, { $inc: { comments: 1 } });
        res
          .status(200)
          .json({ message: "Comment created successfully", comment });
      }
    }
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const translateComment = async (req: Request, res: Response) => {
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

export const makeReaction = async (req: Request, res: Response) => {
  try {
    const { postId, reactionType, userId } = req.body;

    const reaction = new ReactionModel({
      postId,
      reactionType,
      userId,
    });

    await reaction.save();
    await PostModel.findByIdAndUpdate(postId, { $inc: { reacts: 1 } });

    res
      .status(201)
      .json({ message: "Reaction created successfully", reaction });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// export const getPostImage = async (req: Request, res: Response) => {
//   try {
//     const name = req.query.name as string | undefined;
//     if (!name) {
//       return res.status(400).send("Image name is not provided");
//     }
//     const location = path.join(__dirname, "../../", name);

//     res.sendFile(location);
//   } catch (error) {
//     // console.error(error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

export const getPostImage = async (req: Request, res: Response) => {
  try {
    const name = req.query.name as string | undefined;

    if (!name) {
      return res.status(400).send("Image name is not provided");
    }

    const key = `uploads/image/post/${name}`;

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

export const profanityChecker = async (req: Request, res: Response) => {
  try {
    const { comment } = req.body;
    const response = await checkCommentUsingBadwords(comment);
    res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const searchPost = async (req: Request, res: Response) => {
  try {
    const [search] = Object.values(req.query);

    const post = await PostModel.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ],
    });

    if (post.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ posts: post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
