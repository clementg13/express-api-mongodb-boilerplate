const { body } = require("express-validator");
const apiResponse = require("../../../helpers/apiResponse");
const validationResult = require("../../validationResult");
const Book = require("../../../models/BookModel");

exports.bookStore = [
    body("title", "Title must not be empty.")
        .isLength({ min: 1 })
        .trim()
        .escape(),
    body("description", "Description must not be empty.")
        .isLength({ min: 1 })
        .trim()
        .escape(),
    body("isbn", "ISBN must not be empty")
        .isLength({ min: 1 })
        .trim()
        .custom((value, { req }) => {
            return Book.findOne({ isbn: value, user: req.authToken.user._id }).then(
                (book) => {
                    if (book) {
                        return Promise.reject(
                            "Book already exist with this ISBN no."
                        );
                    }
                }
            );
        })
        .escape(),
    body("*").escape(),
    validationResult
];

exports.bookUpdate = [
    body("title", "Title must not be empty.")
        .isLength({ min: 1 })
        .trim()
        .escape(),
    body("description", "Description must not be empty.")
        .isLength({ min: 1 })
        .trim()
        .escape(),
    body("isbn", "ISBN must not be empty")
        .isLength({ min: 1 })
        .trim()
        .custom((value, { req }) => {
            return Book.findOne({
                isbn: value,
                user: req.authToken.user._id,
                _id: { $ne: req.params.id },
            }).then((book) => {
                if (book) {
                    return Promise.reject(
                        "Book already exist with this ISBN no."
                    );
                }
            });
        })
        .escape(),
    body("*").escape(),
    validationResult,
];