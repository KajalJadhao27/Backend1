import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    // Get total video views
    const totalVideoViews = await Video.aggregate([
        { $match: { owner: mongoose.Types.ObjectId(channelId) } },
        { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ]);

    // Get total subscribers
    const totalSubscribers = await Subscription.countDocuments({ channel: channelId });

    // Get total videos
    const totalVideos = await Video.countDocuments({ owner: channelId });

    // Get total likes
    const totalLikes = await Like.countDocuments({ owner: channelId });

    // Prepare the response object
    const channelStats = {
        totalVideoViews: totalVideoViews.length > 0 ? totalVideoViews[0].totalViews : 0,
        totalSubscribers,
        totalVideos,
        totalLikes
    };

    // Send the response
    return res.json(new ApiResponse(true, "Channel stats retrieved", channelStats));
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    // Get all videos uploaded by the channel
    const videos = await Video.find({ owner: channelId }).populate("owner", "username");

    // Send the response
    return res.json(new ApiResponse(true, "Channel videos retrieved", videos));
});

export {
    getChannelStats,
    getChannelVideos
};
