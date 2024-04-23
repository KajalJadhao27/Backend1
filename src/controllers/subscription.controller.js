import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const subscriberId = req.user._id;

    // Check if the channel ID is valid
    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    // Check if the subscription already exists
    const existingSubscription = await Subscription.findOne({ subscriber: subscriberId, channel: channelId });

    // Toggle the subscription status
    if (existingSubscription) {
        // Subscription already exists, meaning user is subscribed. You can handle this case differently if needed.
        return res.json(new ApiResponse(true, "Already subscribed"));
    } else {
        // Subscription doesn't exist, create a new subscription
        await Subscription.create({ subscriber: subscriberId, channel: channelId });
        return res.json(new ApiResponse(true, "Subscription added"));
    }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    // Check if the channel ID is valid
    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    // Find all subscribers of the channel
    const subscribers = await Subscription.find({ channel: channelId }).populate("subscriber", "username");

    // Send the list of subscribers
    return res.json(new ApiResponse(true, "Channel subscribers retrieved", subscribers));
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    // Check if the subscriber ID is valid
    if (!mongoose.isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }

    // Find all channels subscribed by the user
    const subscriptions = await Subscription.find({ subscriber: subscriberId }).populate("channel", "name");

    // Send the list of subscribed channels
    return res.json(new ApiResponse(true, "Subscribed channels retrieved", subscriptions));
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
};
