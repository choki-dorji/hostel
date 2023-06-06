const express = require("express");
const { check } = require("express-validator");

const route = express.Router();

route.get("/", (req, res) => {
  res.render("usermanual");
});

module.exports = route;
