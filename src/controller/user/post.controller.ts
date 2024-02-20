import { Request, Response } from "express";
import PostModel from "../../model/Post";
import ReactionModel from "../../model/reaction";
import CommentModel from "../../model/comment";
import { UserModel } from "../../model/user";

export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, content, userId, photos } = req.body;
    const currentDate = new Date();

   

    const post = new PostModel({
      title,
      content,
      createdAt: currentDate,
      reacts: 0,
      comments: 0,
      author: userId,
        photos: photos.map((url: string) => ({ url })),
 
    });

    await post.save();

    res.status(201).json({ message: "Post created successfully", post });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const checkUserExists = async (userId: string): Promise<boolean> => {
  try {
    const user = await UserModel.findById(userId);

    return !!user;
  } catch (error) {
    console.error("Error checking user existence:", error);
    return false;
  }
};

export const readPost = async (req: Request, res: Response) => {
  try {
    const posts = await PostModel.find().sort({ createdAt: "desc" });
    res.status(200).json({ posts });
  } catch (error) {
    console.error("Error reading posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// export const addComment = async (req: Request, res: Response) => {
//   try {
//     const { postId, userId, content } = req.body;

//     const post = await PostModel.findById(postId);
//     if (!post) {
//       return res.status(404).json({ error: "Post not found" });
//     }

//     CommentModel.push({ content, userId });
//     await post.save();

//     res.status(201).json({ message: "Comment added successfully", post });
//   } catch (error) {
//     console.error("Error adding comment:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// Similar implementation can be done for adding reaction to post
// export const addReactionToComment = async (req: Request, res: Response) => {
//   try {
//     const { commentId, userId, reaction } = req.body;

//     const post = await PostModel.findOne({ "comments._id": commentId });
//     if (!post) {
//       return res.status(404).json({ error: "Comment not found" });
//     }

//     // const comment = post.comments.id(commentId);
//     const comment = post.comments.id(commentId);

//     comment.reaction = reaction;
//     await post.save();

//     res.status(201).json({ message: "Reaction added successfully", post });
//   } catch (error) {
//     console.error("Error adding reaction:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// export const deletePost = async (req: Request, res: Response) => {
//   try {
//     const postId = req.params.id;
//     const userId = req.body.userId;

//     const post = await PostModel.findById(postId);
//     if (!post) {
//       return res.status(404).json({ error: "Post not found" });
//     }

//     if (post.author !== userId) {
//       return res
//         .status(403)
//         .json({ error: "You are not authorized to delete this post" });
//     }

//     await post.remove();

//     res.status(200).json({ message: "Post deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting post:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };
