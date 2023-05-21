const mongoose = require("mongoose");
const HttpError = require("../models/httperror");
const stdb = require("../models/models");
const Allocate = stdb.Allocation;
const Room = stdb.Room;
const Block = stdb.Block;
const AcadYear = stdb.AcadYear;
const disableStudent = require("./apiconnection_lakshay/getStudents");

exports.DisableAllocation = async (req, res, next) => {
  const { sid, room } = req.body;
  const currentYear = new Date().getFullYear();

  let allocationexist;
  try {
    allocationexist = await Allocate.find({
      sid: sid,
      academicyear: currentYear,
    });
  } catch (e) {
    return res.status(400).json({ message: "couldnot find allocation" });
  }
  if (allocationexist.length > 0) {
    return res.status(422).json({
      message:
        "allocation exist already for given student cannot allocate for this year ",
    });
  }
  // console.log(allocationexist)

  //
  // let disstudent;
  //check if the studen was in db
  try {
    disstudent = await disableStudent.GetAllStudents();
  } catch (e) {
    return res.status(400).json({ message: "couldnot find student" });
  }

  if (!disstudent) {
    return res.status(400).json({ message: "couldnot find student" });
  }
  disabled = disstudent.filter(
    (s) =>
      String(s.sid) === String(sid) && s.disability === true && s.gender === "M"
  );

  console.log(disabled, "ertyuio");

  if (!disabled || disabled.length === 0) {
    return res
      .status(400)
      .json({ message: "No student found with provided id" });
  }
  console.log(disabled);
  // get room DETAILS
  let rooms;
  try {
    rooms = await Room.findById(room);
  } catch (e) {
    return res.status(400).json({ message: "No room found with provided id" });
  }
  if (!rooms) {
    return res.status(400).json({ message: "No Room found with provided id" });
  }
  // res.send(rooms)

  let blocks;
  try {
    blocks = await Block.find({ rooms: { $in: [rooms._id] } });
  } catch (e) {
    return res.status(400).json({ message: "No Block found with provided id" });
  }

  if (!blocks) {
    return res.status(400).json({ message: "No Block found with provided id" });
  }

  // res.send(blocks)
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const day = currentDate.getDate();

  const allocate = new Allocate({
    student: disabled[0].id,
    student_name: disabled[0].name,
    roomid: rooms._id,
    room_name: rooms.room_name,
    year: disabled[0].year,
    blockid: blocks[0]._id,
    block_name: blocks[0].block_name,
    course: disabled[0].specialization,
    academicyear: currentYear,
    sid: disabled[0].sid,
    student_gender: disabled[0].gender,
    isDisabled: disabled[0].isDisabled,
    student_email: disabled[0].email,
    created: `${day}/${month}/${year}`,
  });
  try {
    await allocate.save();
    await Room.findByIdAndUpdate(rooms._id, {
      $inc: { availability: -1 },
    });
  } catch (err) {
    console.error(err);
  }

  //get block details

  res.json({ messsage: "Allocated Successfully" });
  // save in allocate
};

// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////
exports.getMaleStudentsDisabled = async (req, res) => {
  try {
    disstudent = await disableStudent.GetAllStudents();
  } catch (e) {
    return res.status(400).json({ message: "couldnot find student" });
  }
  if (!disstudent) {
    return res.status(400).json({ message: "couldnot find student" });
  }
  disabled = disstudent.filter(
    (s) => s.disability === true && s.gender === "M"
  );

  console.log(disabled, "ertyuio");
  return res.status(200).json({ Male: disabled });
};
