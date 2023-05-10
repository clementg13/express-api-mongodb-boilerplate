const UserModel = require("../models/UserModel");
//helper file to prepare responses.
const apiResponse = require("../helpers/apiResponse");
const utility = require("../helpers/utility");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailer = require("../helpers/mailer");
const { constants } = require("../helpers/constants");
const getMailTemplate = require("../helpers/getMailTemplate");

/**
 * User registration.
 *
 * @param {string}      firstName
 * @param {string}      lastName
 * @param {string}      email
 * @param {string}      password
 *
 * @returns {Object}
 */
exports.register = async (req, res) => {
    try {
        //hash input password
        bcrypt.hash(req.body.password, 10, function (err, hash) {
            // generate OTP for confirmation
            let otp = utility.randomNumber(4);
            // Create User object with escaped and trimmed data
            var user = new UserModel({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: hash,
                confirmOTP: otp,
            });
            // Send confirmation email
            mailer
                .send(
                    constants.confirmEmails.from,
                    req.body.email,
                    "Confirm Account",
                    getMailTemplate('confirmAccount', {otp:otp})
                )
                .then(async function () {
                    // Save user.
                    try {
                        await user.save();
                        let userData = {
                            _id: user._id,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            email: user.email,
                        };
                        return apiResponse.successResponseWithData(
                            res,
                            "Registration Success.",
                            userData
                        );
                    } catch (err) {
                        return apiResponse.ErrorResponse(res, err);
                    }
                })
                .catch((err) => {
                    console.log(err);
                    return apiResponse.ErrorResponse(res, err);
                });
        });
    } catch (err) {
        //throw error in json response with status 500.
        return apiResponse.ErrorResponse(res, err);
    }
};

/**
 * User login.
 *
 * @param {string}      email
 * @param {string}      password
 *
 * @returns {Object}
 */
exports.login = async (req, res, next) => {
    try {
        const user = await UserModel.findOne({ email: req.body.email })
            if (user) {
                //Compare given password with db's hash.
                bcrypt.compare(
                    req.body.password,
                    user.password,
                    function (err, same) {
                        if (same) {
                            //Check account confirmation.
                            if (user.isConfirmed) {
                                // Check User's account active or not.
                                if (user.status) {
                                    let userData = {
                                        _id: user._id,
                                        firstName: user.firstName,
                                        lastName: user.lastName,
                                        email: user.email,
                                    };
                                    //Prepare JWT token for authentication
                                    const jwtPayload = {user:userData};
                                    const jwtData = {
                                        expiresIn:
                                            process.env.JWT_TIMEOUT_DURATION,
                                    };
                                    const secret = process.env.JWT_SECRET;
                                    //Generated JWT token with Payload and secret.
                                    userData.token = jwt.sign(
                                        jwtPayload,
                                        secret,
                                        jwtData
                                    );
                                    return apiResponse.successResponseWithData(
                                        res,
                                        "Login Success.",
                                        userData
                                    );
                                } else {
                                    return apiResponse.unauthorizedResponse(
                                        res,
                                        "Account is not active. Please contact admin."
                                    );
                                }
                            } else {
                                return apiResponse.unauthorizedResponse(
                                    res,
                                    "Account is not confirmed. Please confirm your account."
                                );
                            }
                        } else {
                            return apiResponse.unauthorizedResponse(
                                res,
                                "Email or Password wrong."
                            );
                        }
                    }
                );
            } else {
                return apiResponse.unauthorizedResponse(
                    res,
                    "Email or Password wrong."
                );
            }
    } catch (err) {
        return apiResponse.ErrorResponse(res, err);
    }
};

/**
 * Verify Confirm otp.
 *
 * @param {string}      email
 * @param {string}      otp
 *
 * @returns {Object}
 */
exports.verifyConfirm = async (req, res) => {
    try {
        var query = { email: req.body.email };
        const user = await UserModel.findOne(query)
            if (user) {
                //Check already confirm or not.
                if (!user.isConfirmed) {
                    //Check account confirmation.
                    if (user.confirmOTP == req.body.otp) {
                        //Update user as confirmed
                        await UserModel.findOneAndUpdate(query, {
                            isConfirmed: 1,
                            confirmOTP: null,
                        })
                        return apiResponse.successResponse(
                            res,
                            "Account confirmed success."
                        );
                    } else {
                        return apiResponse.unauthorizedResponse(
                            res,
                            "Otp does not match"
                        );
                    }
                } else {
                    return apiResponse.unauthorizedResponse(
                        res,
                        "Account already confirmed."
                    );
                }
            } else {
                return apiResponse.unauthorizedResponse(
                    res,
                    "Specified email not found."
                );
            }
    } catch (err) {
        return apiResponse.ErrorResponse(res, err);
    }
};

/**
 * Resend Confirm otp.
 *
 * @param {string}      email
 *
 * @returns {Object}
 */
exports.resendConfirmOtp = async (req, res, next) => {
    try {
        var query = { email: req.body.email };
        const user = await UserModel.findOne(query)
            if (user) {
                //Check already confirm or not.
                if (!user.isConfirmed) {
                    // Generate otp
                    let otp = utility.randomNumber(4);
                    // Html email body
                    let html =
                        "<p>Please Confirm your Account.</p><p>OTP: " +
                        otp +
                        "</p>";
                    // Send confirmation email
                    mailer
                        .send(
                            constants.confirmEmails.from,
                            req.body.email,
                            "Confirm Account",
                            html
                        )
                        .then(function () {
                            user.isConfirmed = 0;
                            user.confirmOTP = otp;
                            // Save user.
                            user.save(function (err) {
                                if (err) {
                                    return apiResponse.ErrorResponse(res, err);
                                }
                                return apiResponse.successResponse(
                                    res,
                                    "Confirm otp sent."
                                );
                            });
                        });
                } else {
                    return apiResponse.unauthorizedResponse(
                        res,
                        "Account already confirmed."
                    );
                }
            } else {
                return apiResponse.unauthorizedResponse(
                    res,
                    "Specified email not found."
                );
            }
    } catch (err) {
        return apiResponse.ErrorResponse(res, err);
    }
};
