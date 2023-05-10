const express = require("express");
const bookController = require("../controllers/bookController");
const bookMiddleware = require("../middlewares/routes/book/bookMiddlewares.js");
const authenticateJWT = require("../middlewares/jwt");

const router = express.Router();

router.get("/", authenticateJWT, bookController.bookList);
router.get("/:id", authenticateJWT, bookController.bookDetail);
router.post("/", authenticateJWT, bookMiddleware.bookStore, bookController.bookStore);
router.put("/:id", authenticateJWT, bookMiddleware.bookUpdate, bookController.bookUpdate);
router.delete("/:id", authenticateJWT, bookController.bookDelete);

module.exports = router;
