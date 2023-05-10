const Book = require("../models/BookModel");
const { body, validationResult } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");

// Book Schema
function BookData(data) {
    this.id = data._id;
    this.title = data.title;
    this.description = data.description;
    this.isbn = data.isbn;
    this.createdAt = data.createdAt;
}

/**
 * Book List.
 *
 * @returns {Object}
 */
exports.bookList = async (req, res) => {
    try {
        const books = await Book.find(
            { user: req.authToken.user._id },
            "_id title description isbn createdAt"
        );
        if (books.length > 0) {
            return apiResponse.successResponseWithData(
                res,
                "Operation success",
                books
            );
        } else {
            return apiResponse.successResponseWithData(
                res,
                "Operation success",
                []
            );
        }
    } catch (err) {
        //throw error in json response with status 500.
        return apiResponse.ErrorResponse(res, err);
    }
};

/**
 * Book Detail.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.bookDetail = async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return apiResponse.successResponseWithData(
            res,
            "Operation success",
            {}
        );
    }
    try {
        const book = await Book.findOne(
            { _id: req.params.id, user: req.authToken.user._id },
            "_id title description isbn createdAt"
        );
        if (book !== null) {
            let bookData = new BookData(book);
            return apiResponse.successResponseWithData(
                res,
                "Operation success",
                bookData
            );
        } else {
            return apiResponse.successResponseWithData(
                res,
                "Operation success",
                {}
            );
        }
    } catch (err) {
        //throw error in json response with status 500.
        return apiResponse.ErrorResponse(res, err);
    }
};

/**
 * Book store.
 *
 * @param {string}      title
 * @param {string}      description
 * @param {string}      isbn
 *
 * @returns {Object}
 */
exports.bookStore = async (req, res) => {
    try {
        const book = new Book({
            title: req.body.title,
            user: req.authToken.user,
            description: req.body.description,
            isbn: req.body.isbn,
        });
        //Save book.
        try {
            await book.save();
            let bookData = new BookData(book);
            return apiResponse.successResponseWithData(
                res,
                "Book add Success.",
                bookData
            );
        } catch (error) {
            return apiResponse.ErrorResponse(res, err);
        }
    } catch (err) {
        //throw error in json response with status 500.
        return apiResponse.ErrorResponse(res, err);
    }
};

/**
 * Book update.
 *
 * @param {string}      title
 * @param {string}      description
 * @param {string}      isbn
 *
 * @returns {Object}
 */
exports.bookUpdate = async (req, res) => {
    try {
        var book = new Book({
            title: req.body.title,
            description: req.body.description,
            isbn: req.body.isbn,
            _id: req.params.id,
        });

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return apiResponse.validationErrorWithData(
                res,
                "Invalid Error.",
                "Invalid ID"
            );
        } else {
            const foundBook = await Book.findById(req.params.id);
            if (foundBook === null) {
                return apiResponse.notFoundResponse(
                    res,
                    "Book not exists with this id"
                );
            } else {
                //Check authorized user
                if (foundBook.user.toString() !== req.authToken.user._id) {
                    return apiResponse.unauthorizedResponse(
                        res,
                        "You are not authorized to do this operation."
                    );
                } else {
                    //update book.
                    await Book.findByIdAndUpdate(req.params.id, book, {});
                    let bookData = new BookData(book);
                    return apiResponse.successResponseWithData(
                        res,
                        "Book update Success.",
                        bookData
                    );
                }
            }
        }
    } catch (err) {
        //throw error in json response with status 500.
        return apiResponse.ErrorResponse(res, err);
    }
};

/**
 * Book Delete.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.bookDelete = async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return apiResponse.validationErrorWithData(
            res,
            "Invalid Error.",
            "Invalid ID"
        );
    }
    try {
        const foundBook = await Book.findById(req.params.id);
        if (foundBook === null) {
            return apiResponse.notFoundResponse(
                res,
                "Book not exists with this id"
            );
        } else {
            //Check authorized user
            if (foundBook.user.toString() !== req.authToken.user._id) {
                return apiResponse.unauthorizedResponse(
                    res,
                    "You are not authorized to do this operation."
                );
            } else {
                //delete book.
                await Book.findByIdAndRemove(req.params.id);
                return apiResponse.successResponse(res, "Book delete Success.");
            }
        }
    } catch (err) {
        //throw error in json response with status 500.
        return apiResponse.ErrorResponse(res, err);
    }
};
