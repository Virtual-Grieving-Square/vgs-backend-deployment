// Mopdels
import PostModel from "../model/Post";
import LikeModel from "../model/like";

export const like = async (postId: string, likerId: string) => {
  try {

    const likes = await LikeModel.find({
      postId: postId,
      likerId: likerId
    });

    if (likes.length > 0) {
      await LikeModel.deleteMany({
        postId: postId,
        likerId: likerId
      });
      await PostModel.findByIdAndUpdate(postId, { $inc: { likes: -1 } });
      return true;
    } else {
      const like = new LikeModel({
        postId: postId,
        likerId: likerId
      });

      await like.save();
      await PostModel.findByIdAndUpdate(postId, { $inc: { likes: 1 } });

      return true;
    }
  } catch (error) {
    console.error(error);
  }
}