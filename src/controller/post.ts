import { Request, Response } from "express";
import PostModel, { IPost } from "../model/Post";
import { UserModel } from "../model/user";
import ReactionModel from "../model/reaction";
import CommentModel from "../model/comment";
import { Multer } from "multer";

import {
  checkComment,
  checkCommentUsingSapling,
  checkCommentUsingBadwords,
} from "../util/commentFilter";

import Filter from "bad-words";
import LikeModel from "../model/like";
import { getIO } from "../util/socket.io";
import path from "path";

const filter = new Filter();

export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, content, userId } = req.body;
    const currentDate = new Date();

    const photos = (req.files as Express.Multer.File[]).map(
      (file: Express.Multer.File) => ({
        url: file.path,
      })
    );

    const post = new PostModel({
      title,
      content,
      createdAt: currentDate,
      reacts: 0,
      comments: 0,
      author: userId,
      photos: photos,
    });

    await post.save();

    res.status(201).json({ message: "Post created successfully", post });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const countLike = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const likes = await LikeModel.find({
      postId: id,
    });

    res.status(200).json({ likes: likes.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
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
    const io = getIO();

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

      io.emit("server_update_like", { postId, likes: -1 });
      return res.status(200).json({ message: "Post unliked successfully" });
    } else {
      const like = new LikeModel({
        postId: postId,
        likerId: likerId,
      });

      await like.save();

      await PostModel.findByIdAndUpdate(postId, { $inc: { likes: 1 } });

      io.emit("server_update_like", { postId, likes: -1 });

      return res.status(200).json({ message: "Post liked successfully" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPostsWithImages = async (req: Request, res: Response) => {
  try {
    const posts: IPost[] = await PostModel.find()
      .sort({ createdAt: -1 })
      .exec();

    const postsWithImages = posts.map((post) => {
      return {
        _id: post._id,
        title: post.title,
        content: post.content,
        createdAt: post.createdAt,
        reacts: post.reacts,
        comments: post.comments,
        author: post.author,
        photos: post.photos.map((photo: { url: any }) => photo.url),
      };
    });

    res.status(200).json(postsWithImages);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;

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
    const io = getIO();

    const comment = new CommentModel({
      authorId: authorId,
      content: content,
      postId: postId,
      userId: userId,
    });

    // Check if the comment contains bad words from library
    const response: any = filter.isProfane(content);
    const response2: any = await checkCommentUsingBadwords(content);
    console.log(response);

    // if (filter.isProfane(content)) {
    //   return res.status(400).json({ error: "Inappropriate comment detected" });
    // }

    // const isCommentInappropriate = await checkCommentUsingSapling(content);
    let user = await UserModel.findById(authorId);
    if (user) {
      var strike = user.blacklistCount;

      // console.log(isCommentInappropriate)
      if (filter.isProfane(content) || response2 ) {
        try {
          if (strike < 2) {
            user.blacklistCount += 1;
            await user.save();
            return res
              .status(400)
              .json({ error: "Inappropriate comment detected" });
          } else if (strike === 2) {
            user.blacklistCount += 1;

            user.flag = "suspended";
            await user.save();
            return res.status(400).json({
              error: "Inappropriate comment detected and account suspended",
            });
          } else if (strike > 2) {
            return res.status(400).json({
              error: "Account Suspended",
            });
          }
        } catch (error) {
          console.error("Error updating user blacklist count:", error);
        }
      }

      if (strike > 2) {
        return res.status(400).json({
          error: "Account Suspended",
        });
      } else {
        await comment.save();
        await PostModel.findByIdAndUpdate(postId, { $inc: { comments: 1 } });

        io.emit("server_update_comment");

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

export const getPostImage = async (req: Request, res: Response) => {
  try {
    const name = req.query.name as string | undefined;
    if (!name) {
      return res.status(400).send("Image name is not provided");
    }
    const location = path.join(__dirname, "../../", name);

    res.sendFile(location);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
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
