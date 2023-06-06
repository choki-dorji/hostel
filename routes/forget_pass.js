const express = require("express");
const { check } = require("express-validator");

const route = express.Router();
const render = require("../service/render");

route.get("/", render.resetpassword);
route.get("/success", render.successreset);

module.exports = route;
