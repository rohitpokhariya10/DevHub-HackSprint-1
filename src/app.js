require("dotenv").config();
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth.routes");
const errorMiddleware = require("./middleware/error.middleware");
const profileRouter = require("./routes/profile.routes");

app.use(express.json());
app.use(cookieParser());

//
app.use("/api/auth" , authRouter);
//
app.use("/api/profile" , profileRouter)

//
app.use(errorMiddleware);

module.exports = app;