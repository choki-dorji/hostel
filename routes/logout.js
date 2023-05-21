const express = require("express");
const { check } = require("express-validator");

const route = express.Router();

route.get("/", (req, res) => {
  res.clearCookie("tokenABC"); // Clear the token cookie
  res.clearCookie("userData"); // Clear the userData cookie
  res.redirect("/login"); // Redirect to the login page
});

module.exports = route;
