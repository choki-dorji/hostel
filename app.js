const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");
const cookieParser = require("cookie-parser");
const blockRoute = require("./routes/router");
const HttpError = require("./models/httperror");
const RoomRoutes = require("./routes/roomRoutes");
const yearRoute = require("./routes/year");
const request = require("./routes/request");
const student = require("./routes/students");
const allocate = require("./routes/allocate");
const logout = require("./routes/logout");
const chart = require("./routes/chart");
const RecentActivity = require("./routes/recent");
const login = require("./routes/login");
const landing = require("./routes/langing");
const app = express();

require("dotenv").config(); // Load environment variables from .env file

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Middleware function to check for token in cookie
// const checkToken = (req, res, next) => {
//   const token = req.cookies.token;
//   if (!token && req.originalUrl !== "/login") {
//     return res.redirect("/login");
//   }
//   next();
// };

// const checkAuth = (req, res, next) => {
//   const token = req.cookies.token; // Modify this according to your token storage mechanism
//   if (!token) {
//     return res.redirect("/login");
//   }
//   next();
// };

app.use("/", blockRoute.route);

app.use("/landing", landing.route);

app.use("/room", RoomRoutes.route);

app.use("/year", yearRoute.route);

app.use("/Allocate", allocate.route);

app.use("/request", request.route);

app.use("/dashboard", chart);

app.use("/login", login);

app.use("/logout", logout);

app.use("/recent", RecentActivity);

// students
app.use("/students", student.route);

// app.get("*", function (req, res) {
//   res.status(404).render("pagenotfound/index");
// });

app.set("view engine", "ejs");

// load assets
app.use("/css", express.static(path.resolve(__dirname, "assets/css")));
app.use("/img", express.static(path.resolve(__dirname, "assets/img")));
app.use("/js", express.static(path.resolve(__dirname, "assets/js")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// app.use((req, res, next) => {
//   const error = new HttpError("could not find this route", 404);
//   throw error;
// });

app.use((error, req, res, next) => {
  if (error.code === "ENOTFOUND") {
    // Handle network error
    res.status(500).json({ message: "Network error. Please try again later." });
  } else {
    // Handle other errors
    if (!res.headerSent) {
      res.status(error.code || 500);
      res.json({ message: error.message || "An error occurred!" });
    }
  }
});

let server;

function connectWithRetry() {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("Connected to the database");
    })
    .catch((error) => {
      console.log("Failed to connect to the database:", error.message);
      console.log("Retrying connection in 5 seconds...");
      setTimeout(connectWithRetry, 5000);
    });
}

connectWithRetry();

mongoose.connection.on("disconnected", () => {
  console.log("Lost MongoDB connection...");
  console.log("Reconnecting...");
  connectWithRetry();
});

mongoose.connection.on("error", (error) => {
  console.log("MongoDB connection error:", error.message);
});
// mongodb://localhost:27017/HostelAllocation
// mongodb+srv://Choki:Bumthap123@cluster0.7i7nwco.mongodb.net/HostelAllocation?retryWrites=true&w=majority
mongoose
  .connect(process.env.MONGODB_URI) // Use the MongoDB Atlas connection string from environment variables
  .then(() => {
    app.listen(5000);
    console.log("connect to database");
  })
  .catch((error) => {
    console.log(error);
  });
