import CommentModel from '../Models/CommentsModel.js';
import mongoose from 'mongoose';

export const getComments = async (req, res) => {
    try{
        const { characterId, seriesId } = req.params;

        if (!characterId && !seriesId) return res.status(400).json({ message: 'No characterId or seriesId provided' });

        const commentQuery = characterId ? { commentOnCharacter : characterId } : { commentOnSeries : seriesId };
        const comments = await CommentModel.find(commentQuery).populate('commentBy', 'username profilePic').populate('repliedTo', "content commentBy").sort({ createdAt: -1 });
        res.status(200).json({ comments });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

export const addComment = async (req, res) => {
    try {
        const { characterId, seriesId, content } = req.body;
        const { id } = req.user; 

        if (!content?.trim()) {
            return res.status(400).json({ message: "Content is required" });
        }

        const newComment = new CommentModel({ commentOnCharacter : characterId || null, commentOnSeries : seriesId || null, commentBy : id, content });
        await newComment.save();

        const populated = await newComment.populate("commentBy", "username profilePic");
        res.status(201).json({ comment: populated });

    } catch (err) {
        console.error("Error adding comment:", err);
        res.status(500).json({ message: "Failed to add comment" });
    }
}

export const addRepliedComments = async (req, res) => {
    try {
        const { commentId, content } = req.body;
        const { id } = req.user;

        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(400).json({ message: "Invalid commentId" });
        }

        const parentComment = await CommentModel.findById(commentId);
        if (!parentComment) {
            return res.status(404).json({ message: "Parent comment not found" });
        }

        const reply = new CommentModel({ commentOnCharacter : parentComment.commentOnCharacter, commentOnSeries : parentComment.commentOnSeries, commentBy : id, repliedTo : commentId, content });
        await reply.save();
        const populated = await reply.populate("commentBy", "username profilePic");
        res.status(201).json({ reply: populated });

    } catch (err) {
        console.error("Error adding reply:", err);
        res.status(500).json({ message: "Failed to add reply" });
    }
};

export const addCommentLike = async (req, res) => {
    try {
        const { commentId } = req.body;
        const { id } = req.user;

        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(400).json({ message: "Invalid commentId" });
        }

        const comment = await CommentModel.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const alreadyLiked = comment.likes.includes(id);
        if (alreadyLiked) {
            comment.likes.pull(id);
        } else {
            comment.likes.push(id);
        }
        await comment.save();

        res.status(200).json({
            message: alreadyLiked ? "Unliked comment" : "Liked comment",
            likesCount: comment.likes.length,
        });
    } catch (err) {
        console.error("Error liking comment:", err);
        res.status(500).json({ message: "Failed to like comment" });
    }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.body;
    const { id: userId } = req.user;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: "Invalid commentId" });
    }

    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.commentBy.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    await CommentModel.findByIdAndDelete(commentId);

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ message: "Failed to delete comment" });
  }
};
