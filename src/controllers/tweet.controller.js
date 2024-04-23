import mongoose from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    // Check if content is provided
    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    // Create a new tweet document
    const tweet = await Tweet.create({ content, owner: req.user._id });

    // Send a response indicating success
    return res.json(new ApiResponse(true, "Tweet created", tweet));
});

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // Find all tweets associated with the user ID
    const tweets = await Tweet.find({ owner: userId });

    // Send a response with the list of tweets
    return res.json(new ApiResponse(true, "User tweets retrieved", tweets));
});

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    // Check if content is provided
    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    // Find the tweet by its ID
    let tweet = await Tweet.findById(tweetId);

    // Check if the tweet exists
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // Check if the user owns the tweet
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this tweet");
    }

    // Update the tweet's content
    tweet.content = content;
    await tweet.save();

    // Send a response indicating success
    return res.json(new ApiResponse(true, "Tweet updated", tweet));
});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    // Find the tweet by its ID
    let tweet = await Tweet.findById(tweetId);

    // Check if the tweet exists
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // Check if the user owns the tweet
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this tweet");
    }

    // Delete the tweet
    await tweet.remove();

    // Send a response indicating success
    return res.json(new ApiResponse(true, "Tweet deleted"));
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
};
