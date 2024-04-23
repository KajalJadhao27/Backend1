import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
    // Build a health check response
    const healthCheckResponse = {
        status: "OK",
        message: "Server is healthy"
    };

    // Send the health check response as JSON
    return res.json(healthCheckResponse);
});

export {
    healthcheck
};
