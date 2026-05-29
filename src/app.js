require("dotenv").config();
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth.routes");
const errorMiddleware = require("./middleware/error.middleware");
const profileRouter = require("./routes/profile.routes");

// Global parsers are registered before routers so all endpoints share request handling.
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
// Authentication routes own registration, login, and OAuth callbacks.
app.use("/api/auth" , authRouter);
// Profile routes own private profile management and public profile lookup.
app.use("/api/profile" , profileRouter)

// Keep error middleware last so errors from every route flow through one response shape.
app.use(errorMiddleware);

module.exports = app;
