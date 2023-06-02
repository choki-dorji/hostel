const express = require("express");
const route = express.Router();
const { check } = require("express-validator");

route.get("/", (req, res) => {
  res.render("landingpage/index");
});

exports.route = route;
