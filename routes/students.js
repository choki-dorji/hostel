const express = require("express");
const route = express.Router();

const student = require("../controllers/student");
const service = require("../service/studentRender");
const service1 = require("../service/render");
const students = require("../controllers/apiconnection_lakshay/getStudents");

// for thr ejs
// route.get("/", service.getBlocks);
route.get("/", service.StudentDashboard);

route.get("/get-roommate/:uid", student.getRoommates);

route.get("/getroom/:students", student.getRoomsFromStudent);

route.post("/changeroom/:uid", student.hostelChangeRequest);

route.get("/search", student.searchStudentsBySID);

route.get("/count/:years", student.countStudentsByYear);

route.post("/delete/:students", student.createRemovedStudent);

route.get("/allstudents", students.TotalAllStudents);

route.get("/student/:id", students.studentsbyName);

route.get("/students/display", service.search_student);

// API

exports.route = route;
