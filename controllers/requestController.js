const axios = require("axios");
const HttpError = require("../models/httperror");
const nodemailer = require("nodemailer");

const stdb = require("../models/models");
const Room = stdb.Room;
const Block = stdb.Block;
const Request = stdb.Request;
const Allocate = stdb.Allocation;
const RecentActivity = stdb.RecentActivity;

// get request
const API = "http://localhost:5000/";

// get request by date
exports.getAllhostelChangeRequest = async (req, res) => {
  const token = req.cookies.tokenABC;
  const user = req.cookies.userData;
  const username = JSON.parse(user);
  try {
    const viewMore = req.query.viewMore === "true"; // Check if view more button was clicked
    const notificationCount = await Request.countDocuments({ clicked: false });

    let requests;
    if (viewMore) {
      requests = await Request.find({}).sort({ Requested: -1 });
    } else {
      requests = await Request.find({}).sort({ Requested: -1 }).limit(10);
    }

    Promise.all([
      axios.get(`${API}api/blocks`),
      axios.get(`${API}room/api/rooms`),
    ])
      .then((responses) => {
        const block = responses[0].data;
        const room = responses[1].data;
        res.render("Request/index", {
          blocks: block,
          rooms: room,
          requests: requests,
          username: username,
          token: token,
          notificationCount: notificationCount,
        });
      })
      .catch((err) => {
        res.send(err);
      });

    // res.send(requests);
    // res.render("Request/index", { requests: requests });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
};
// ///////////////////////////////
//initialize email
// send email notification to the user
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: "hostelallocations@gmail.com",
    pass: "pzeqibrcubljtdrj",
  },
});

// update request////////////////////////////////////////////////////////////////////////
exports.UpdateRequest = async (req, res) => {
  const requestId = req.params.id;
  const { remarks, status } = req.body;

  if (!req.body) {
    return res.status(500).json({ message: "Required to pass the remarks" });
  }

  // date and timeout
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const date = now.getDate();
  const time = now.getTime();
  const currentDateTime = now.toLocaleDateString();

  let request;
  try {
    request = await Request.findOne({ _id: requestId });
  } catch (err) {
    console.error(err);
    const error = new HttpError(
      "Something went wrong, could not update request1",
      500
    );
    return res.status(error.code || 500).json({ message: error.message });
  }

  console.log("request ", request);

  if (!request) {
    const error = new HttpError(
      "Could not find a request for the provided ID",
      404
    );
    return res.status(error.code || 500).json({ message: error.message });
  }

  if (status === "accepted") {
    const currentRoom = request.room;
    const newRoom = request.targetroom;

    const stayingroom = await Room.findById(currentRoom);

    const currRoom = await Room.findOne({ _id: newRoom });
    const currBlock = await Block.findOne({ _id: request.targetblock });

    console.log("newRoom", newRoom);

    // Update allocation table
    let allocation;
    try {
      allocation = await Allocate.findOneAndUpdate(
        {
          sid: request.student,
          year: request.student_year,
          academicyear: new Date().getFullYear(),
        },
        {
          $set: {
            roomid: newRoom,
            blockid: request.targetblock,
            room_name: currRoom.room_name,
            block_name: currBlock.block_name,
          },
        },
        { new: true }
      );
      console.log(`Allocation updated: ${allocation}`);
    } catch (err) {
      console.error("allocation error /", err);
      const error = new HttpError(
        "Something went wrong, could not update allocation",
        500
      );
      return res.status(error.code || 500).json({ message: error.message });
    }

    // Update request table
    request.remarks = remarks || request.remarks;
    request.status = "accepted";
    request.clicked = true;
    request.reason = request.remarks;
    request.reqyear = request.reqyear;

    // in recent table
    const recent = new RecentActivity({
      student: request.student,
      Description: "Accepted",
      room: "from " + stayingroom.room_name + " to " + currRoom.room_name,
      date: currentDateTime,
    });
    try {
      await request.save();
      await recent.save();
      await allocation.save();
      console.log(`Request updated: ${request}`);

      const mailOptions = {
        from: "hostelallocations@gmail.com",
        to: "ceedeejee9@gmail.com",
        // to: `${request.student_email}`,
        subject: "Request Status Updated",
        text: `Dear ${request.student_name},\n\nYour request to change room has been approved to ${request.status}. You can now move to the new room, You can vie detail sfrom your HAS Account`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log(`Email sent: ${info.response}`);
        }
      });
    } catch (err) {
      console.log(err);
      const error = new HttpError(
        "Something went wrong, could not update request",
        500
      );
      return res.status(error.code || 500).json({ message: error.message });
    }

    // Update room table
    try {
      const room = await Room.findByIdAndUpdate(
        newRoom,
        { $inc: { availability: -1 } },
        { new: true }
      );
    } catch (err) {
      console.error(err);
      const error = new HttpError(
        "Something went wrong, could not update availability",
        500
      );
      return res.status(error.code || 500).json({ message: error.message });
    }
  } else if (status === "rejected") {
    const currentRoom = request.room;
    const newRoom = request.targetroom;
    const stayingroom = await Room.findById(currentRoom);
    const currRoom = await Room.findOne({ _id: newRoom });
    const currBlock = await Block.findOne({ _id: request.targetblock });
    // Update request table
    request.remarks = remarks || request.remarks;
    request.status = "Rejected";
    request.clicked = true;
    request.reason = request.reason;
    request.reqyear = request.reqyear;

    //reject
    const recent = new RecentActivity({
      student: request.student,
      Description: "Rejected",
      room: "from " + stayingroom.room_name + " to " + currRoom.room_name,
      date: currentDateTime,
    });
    try {
      await request.save();
      await recent.save();
      console.log(`Request updated: ${request}`);
      const mailOptions = {
        from: "hostelallocations@gmail.com",
        to: "ceedeejee9@gmail.com",
        // to:`${request.student_email}`,
        subject: "Request Status Updated",
        text: `Dear ${request.student_name},\n\nYour request to change room has been rejected, I am so sorry for further informtion you can see your HAS system. `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log(`Email sent: ${info.response}`);
        }
      });
    } catch (err) {
      console.log(err);
      const error = new HttpError(
        "Something went wrong, could not update request",
        500
      );
      return res.status(error.code || 500).json({ message: error.message });
    }
  } else {
    const error = new HttpError("Invalid status value", 400);
    return res.status(error.code || 500).json({ message: error.message });
  }

  // res.json({ message: "Request updated successfully" });
  res.send("Request Granted Successfully");
};

//////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
exports.getAllRequest = async (req, res) => {
  const notificationCount = await Request.countDocuments({ clicked: false });
  const token = req.cookies.tokenABC;
  const user = req.cookies.userData;
  const username = JSON.parse(user);
  let request;
  let room;
  let blocks;
  console.log("token in request ", token);
  // /////////////////
  try {
    room = await Room.find({});
  } catch (err) {
    const error = new HttpError("Fetching Requests failed", 500);
    return res.status(error.code || 500).json({ message: error.message });
  }
  /////////////////////////////
  try {
    blocks = await Block.find({});
  } catch (err) {
    const error = new HttpError("Fetching Requests failed", 500);
    return res.status(error.code || 500).json({ message: error.message });
  }
  /////////////////////////
  try {
    request = await Request.find({});
  } catch (err) {
    const error = new HttpError("Fetching Requests failed", 500);
    return res.status(error.code || 500).json({ message: error.message });
  }
  // res.json({ Block: blocks.map((block) => block.toObject({ getters: true })) });
  res.render("Request/requestHistory", {
    block: blocks,
    request: request,
    token: token,
    room: room,
    notificationCount: notificationCount,
    username: username,
  });
};

////////////////////////grt request by sid

exports.getRequestBySid = async (req, res, next) => {
  const sid = req.params.sid;

  let blocks;
  try {
    blocks = await Request.find({ student: sid });
  } catch (err) {
    const error = new HttpError(
      "something went wrong, could not find a request",
      500
    );
    return res.status(error.code || 500).json({ message: error.message });
  }

  if (!blocks) {
    const error = new HttpError(
      "Could not find an request for the student",
      404
    );
    return res.status(error.code || 500).json({ message: error.message });
  }

  // res.json({
  //   block: blocks.toObject({ getters: true }),
  // });
  res.send(blocks);
};
