const express = require("express");
const { check } = require("express-validator");

const route = express.Router();
const recent = require("../controllers/recent");

route.get("/recent", recent.getAllRecentActivities);


module.exports = route;
