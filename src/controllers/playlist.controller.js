import mongoose from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    // Create a new playlist document
    const playlist = await Playlist.create({ name, description, owner: req.user._id });

    // Send a response indicating success
    return res.json(new ApiResponse(true, "Playlist created", playlist));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // Find all playlists associated with the user ID
    const playlists = await Playlist.find({ owner: userId });

    // Send a response with the list of playlists
    return res.json(new ApiResponse(true, "User playlists retrieved", playlists));
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    // Find the playlist by its ID
    const playlist = await Playlist.findById(playlistId);

    // Check if the playlist exists
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Send a response with the playlist details
    return res.json(new ApiResponse(true, "Playlist retrieved", playlist));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    // Find the playlist by its ID
    const playlist = await Playlist.findById(playlistId);

    // Check if the playlist exists
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Add the video ID to the playlist's videos array
    playlist.videos.push(videoId);
    await playlist.save();

    // Send a response indicating success
    return res.json(new ApiResponse(true, "Video added to playlist", playlist));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    // Find the playlist by its ID
    const playlist = await Playlist.findById(playlistId);

    // Check if the playlist exists
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Remove the video ID from the playlist's videos array
    playlist.videos.pull(videoId);
    await playlist.save();

    // Send a response indicating success
    return res.json(new ApiResponse(true, "Video removed from playlist", playlist));
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    // Find the playlist by its ID and delete it
    await Playlist.findByIdAndDelete(playlistId);

    // Send a response indicating success
    return res.json(new ApiResponse(true, "Playlist deleted"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    // Find the playlist by its ID
    const playlist = await Playlist.findById(playlistId);

    // Check if the playlist exists
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Update the playlist's name and description
    playlist.name = name;
    playlist.description = description;
    await playlist.save();

    // Send a response indicating success
    return res.json(new ApiResponse(true, "Playlist updated", playlist));
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
};
