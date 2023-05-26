const express = require("express");
const route = express.Router();

const requestget = require("../controllers/requestController");
const renderpage = require("../service/render");

route.get("/", requestget.getAllhostelChangeRequest);
route.put("/update/:id", requestget.UpdateRequest);
// route.get("/allrequest", renderpage.getHistory);

route.get("/allrequest", requestget.getAllRequest);
route.get("/details", renderpage.detailsrequest)


exports.route = route;
