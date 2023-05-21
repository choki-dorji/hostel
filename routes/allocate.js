const express = require("express");
const route = express.Router();

const service = require("../service/render");
const allocateController = require("../controllers/Allocate");
const allocatedisable = require("../controllers/allocateDisable");
const allocatefemaleDisable = require("../controllers/allocatedisableFemale");

// for thr ejs
// route.get("/", service.getBlocks);
route.get("/getMaleDisable", allocatedisable.getMaleStudentsDisabled);
route.get("/getFemaleDisable", allocatefemaleDisable.getFemaleStudentsDisabled);

route.post("/disable", allocatedisable.DisableAllocation);
route.post("/disableF", allocatefemaleDisable.DisableAllocation);

route.get("/disablefemale", service.disableF);
route.get("/disable", service.disable);

// API
route.post("/api/years/:year", allocateController.allocateRoomByYearAndBlock);
route.get("/api/years/:year", allocateController.getallocationbyYear);

route.get("/all", allocateController.getallocation);

exports.route = route;
