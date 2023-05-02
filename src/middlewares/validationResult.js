const { validationResult } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");

function Index(req, res, next) {
    try {
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Display sanitized values/errors messages.
            return apiResponse.validationErrorWithData(
                res,
                "Validation Error.",
                errors.array()
            );
        } else {
            next();
        }
    } catch (err) {
        //throw error in json response with status 500.
        return apiResponse.ErrorResponse(res, err);
    }
}

module.exports = Index;
