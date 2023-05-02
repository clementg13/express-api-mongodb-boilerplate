const jwt = require("jsonwebtoken");
const apiResponse = require("../helpers/apiResponse");
const { decode } = require("punycode");

// Middleware to verify JWT token
const authenticateJWT = function (req, res, next) {
    // Get token from request headers
    let token = req.headers["x-access-token"] || req.headers["authorization"];
    if (!token) {
        return apiResponse.unauthorizedResponse(res, "JWT token is missing");
    }

    // Check if token starts with Bearer
    if (token.startsWith("Bearer ")) {
        // Remove Bearer from token
        token = token.slice(7, token.length);
    }

    // Verify JWT token
    jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
        if (err) {
            return apiResponse.unauthorizedResponse(res, "Invalid JWT token");
        } else {
            // Check if token is expired
			const expirationTime = decoded.exp * 1000; // convert to milliseconds
			const now = Date.now();

			if (now >= expirationTime) {
                return apiResponse.unauthorizedResponse(res, "Expired JWT token");
            } else {
                // Set user information from token to request object
                req.authToken = decoded;
                next();
            }
        }
    });
};


module.exports = authenticateJWT;
