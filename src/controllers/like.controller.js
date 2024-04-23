import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleLike = async (req, res, entityType) => {
    const { entityId } = req.params;
    const userId = req.user._id;

    // Check if entityId is a valid ObjectId
    if (!mongoose.isValidObjectId(entityId)) {
        throw new ApiError(400, "Invalid entity ID");
    }

    // Find the like associated with the entity and user
    const existingLike = await Like.findOne({ [entityType]: entityId, likedBy: userId });

    if (existingLike) {
        // If the like exists, remove it
        await existingLike.remove();
        return res.json(new ApiResponse(true, "Like removed"));
    } else {
        // If the like does not exist, create it
        await Like.create({ [entityType]: entityId, likedBy: userId });
        return res.json(new ApiResponse(true, "Like added"));
    }
};

const toggleVideoLike = asyncHandler(async (req, res) => {
    await toggleLike(req, res, "video");
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    await toggleLike(req, res, "comment");
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    await toggleLike(req, res, "tweet");
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Find all likes by the user
    const likedVideos = await Like.find({ likedBy: userId }).populate("video");

    return res.json(new ApiResponse(true, "Liked videos retrieved", likedVideos));
});

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
};
