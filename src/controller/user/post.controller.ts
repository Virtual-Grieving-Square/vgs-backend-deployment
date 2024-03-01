import { Request, Response } from "express";
import PostModel, { IPost } from "../../model/Post";
import { UserModel } from "../../model/user";
import ReactionModel from "../../model/reaction";
import CommentModel from "../../model/comment";
import { Multer } from "multer";
import {
  checkComment,
  checkCommentUsingSapling,
} from "../../util/commentFilter";
import Filter from "bad-words";

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

export const getPostsWithImages = async (req: Request, res: Response) => {
  try {
    const posts: IPost[] = await PostModel.find().exec();

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

export const createComment = async (req: Request, res: Response) => {
  try {
    const { authorId, content, postId } = req.body;

    // Check if the comment contains bad words from library
    // const response: any = filter.isProfane(content);
    // console.log(response)
    // if (filter.isProfane(content)) {
    //   return res.status(400).json({ error: "Inappropriate comment detected" });
    // }

    const comment = new CommentModel({
      authorId,
      content,
      postId,
    });

    //  const isCommentInappropriate = await checkComment(content);

    const isCommentInappropriate = await checkCommentUsingSapling(content);

    if (isCommentInappropriate) {
      try {
        const user = await UserModel.findById(authorId);

        if (user) {
          if (user.blacklistCount < 2) {
            user.blacklistCount += 1;
            await user.save();
            return res
              .status(400)
              .json({ error: "Inappropriate comment detected" });
          } else if (user.blacklistCount === 2) {
            user.blacklistCount += 1;

            user.flag = "suspended";
            await user.save();
            return res
              .status(400)
              .json({
                error: "Inappropriate comment detected and account suspended",
              });
          }
        }
      } catch (error) {
        console.error("Error updating user blacklist count:", error);
      }
    }

    await comment.save();
    await PostModel.findByIdAndUpdate(postId, { $inc: { comments: 1 } });

    res.status(201).json({ message: "Comment created successfully", comment });
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

//helperfunctions
