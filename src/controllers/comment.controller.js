import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const comments = await Comment.find({ videoId })
        .skip(skip)
        .limit(limit)
        .exec();

    res.json(comments);
});

const addComment = asyncHandler(async (req, res) => {
    const { videoId, text } = req.body;

    const comment = new Comment({
        videoId,
        text,
    });

    await comment.save();

    res.json(comment);
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { text } = req.body;

    const comment = await Comment.findByIdAndUpdate(commentId, { text }, { new: true });

    if (!comment) {
        throw new ApiError(404, 'Comment not found');
    }

    res.json(comment);
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const comment = await Comment.findByIdAndDelete(commentId);

    if (!comment) {
        throw new ApiError(404, 'Comment not found');
    }

    res.json({ message: 'Comment deleted successfully' });
});

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
};
