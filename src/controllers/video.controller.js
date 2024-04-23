import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    let { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    // Parse the page and limit parameters
    page = parseInt(page);
    limit = parseInt(limit);

    // Create the aggregation pipeline for pagination, sorting, and filtering
    const pipeline = [];

    // Pagination
    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: limit });

    // Sorting
    if (sortBy && sortType) {
        const sortField = sortBy === "title" ? sortBy : "createdAt"; // Adjust as needed
        const sortOrder = sortType === "asc" ? 1 : -1;
        pipeline.push({ $sort: { [sortField]: sortOrder } });
    }

    // Filtering
    if (query) {
        pipeline.push({
            $match: {
                $or: [
                    { title: { $regex: query, $options: "i" } },
                    { description: { $regex: query, $options: "i" } }
                ]
            }
        });
    }

    // Get videos based on userId if provided
    if (userId) {
        pipeline.push({ $match: { owner: mongoose.Types.ObjectId(userId) } });
    }

    // Perform aggregation
    const videos = await Video.aggregate(pipeline);

    // Count total documents for pagination
    const totalVideos = await Video.countDocuments();

    // Send response
    return res.json(new ApiResponse(true, "Videos retrieved", { videos, totalVideos }));
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description, videoFile, thumbnail, duration } = req.body;

    // Upload video file and thumbnail to Cloudinary
    const uploadedVideo = await uploadOnCloudinary(videoFile);
    const uploadedThumbnail = await uploadOnCloudinary(thumbnail);

    // Create the video
    const video = await Video.create({
        title,
        description,
        videoFile: uploadedVideo.secure_url,
        thumbnail: uploadedThumbnail.secure_url,
        duration,
        owner: req.user._id
    });

    // Send response
    return res.json(new ApiResponse(true, "Video published", video));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Find video by ID
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Send response
    return res.json(new ApiResponse(true, "Video retrieved", video));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description, thumbnail } = req.body;

    // Find video by ID
    let video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Update video details
    video.title = title;
    video.description = description;
    if (thumbnail) {
        const uploadedThumbnail = await uploadOnCloudinary(thumbnail);
        video.thumbnail = uploadedThumbnail.secure_url;
    }

    // Save the updated video
    await video.save();

    // Send response
    return res.json(new ApiResponse(true, "Video updated", video));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Find video by ID and remove it
    const video = await Video.findByIdAndDelete(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Send response
    return res.json(new ApiResponse(true, "Video deleted"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Find video by ID
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Toggle the isPublished field
    video.isPublished = !video.isPublished;
    await video.save();

    // Send response
    return res.json(new ApiResponse(true, "Publish status toggled", video));
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
};
