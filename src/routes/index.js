const express = require("express");
const authRouter = require("./auth");
const bookRouter = require("./book");

const router = express.Router();

router.use("/auth", authRouter);
router.use("/book", bookRouter);


module.exports = router;
