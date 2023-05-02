const express = require("express");
const app = express();
const morgan = require("morgan");
require("dotenv").config();
const cors = require("cors");
const mongoose = require("mongoose");

const apiResponse = require("./helpers/apiResponse");
const router = require("./routes/index");

mongoose
    .connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("");
        console.log(
            "Connected to %s",
            process.env.MONGODB_URL.replace(/(?<=:\/\/.*?:).*?(?=@)/, "****")
        );
        console.log("App is running ... \n");
        console.log("Press CTRL + C to stop the process. \n");
    })
    .catch((err) => {
        console.error("App starting error:", err.message);
        process.exit(1);
    });
const db = mongoose.connection;

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors());
app.use("/api/v1", router);

app.all("*", function (req, res) {
    return apiResponse.notFoundResponse(res, "Route not found");
});

app.use((err, req, res) => {
    if (err.name == "UnauthorizedError") {
        return apiResponse.unauthorizedResponse(res, err.message);
    }
});

app.listen(process.env.PORT, () => {
    console.log(
        "-------------------------------------------------------------"
    );
    console.log("Server launch");
    console.log("Listening on port " + process.env.PORT + "...");
    console.log("http://localhost:" + process.env.PORT + "/api/v1/");
    console.log(
        "-------------------------------------------------------------"
    );
});
