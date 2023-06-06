const axios = require("axios");
const HttpError = require("../models/httperror");
const multer = require("multer");
const stud = require("../models/models");
const Allocate = stud.Allocation;
const Block = stud.Block;
const rooms = stud.Room;
const Request = stud.Request;
const removedStudents = stud.removedStudents;
const api_students = require("./apiconnection_lakshay/getStudents");
const path = require("path");
const { google } = require("googleapis");
const fs = require("fs");

// service account key file from Google Cloud console.
const KEYFILEPATH = path.join(__dirname, "../hostel-management.json");

// Request full drive access.
const SCOPES = ["https://www.googleapis.com/auth/drive"];

// Create a service account initialize with the service account key file and scope needed
const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

const driveService = google.drive({ version: "v3", auth });

// check connection
driveService.about.get(
  {
    fields: "user",
  },
  (err, res) => {
    if (err) {
      console.error("Error connecting to Google Drive API:", err.message);
    } else {
      console.log(
        "Successfully connected to Google Drive API as user:",
        res.data.user.emailAddress
      );
    }
  }
);

//function to upload the file
async function uploadFile(filePath, filename) {
  // // Search for the parent folder using its name
  let fileMetadata = {
    name: filename,
    parents: ["1epK4qfijzAVdIOE-CNiNdDUBOGMNZLA8"],
  };

  let media = {
    mimeType: "image/*",
    body: fs.createReadStream(filePath),
  };

  let response = await driveService.files.create({
    resource: fileMetadata,
    media: media,
    fields: "id",
  });

  switch (response.status) {
    case 200:
      let fileId = response.data.id;
      console.log("Created File Id: ", response.data.id);
      // delete file
      fs.unlinkSync(filePath);
      return fileId;
    default:
      console.error("Error creating the file, " + response.error);
      break;
  }
}

// get roomm mate
exports.getRoommates = async (req, res) => {
  const currentYear = new Date().getFullYear();
  try {
    const userId = req.params.uid;
    const allocation = await Allocate.findOne({
      sid: userId,
      academicyear: currentYear,
    }).populate("roomid");
    if (!allocation) {
      // return res.status(404).json({ message: "Allocation not found" });
      return res.send("");
    }
    const roomId = allocation.roomid;
    const roommates = await Allocate.find({
      roomid: roomId,
      academicyear: currentYear,
    }).populate("student");
    const mateNames = roommates
      .filter((mate) => mate.sid !== userId)
      .map((mate) => mate);
    // res.json({ mates: mateNames });
    // //console.log(mateNames);
    res.send(mateNames);
  } catch (err) {
    //console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
// const storage = new Storage({
//   keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
//   projectId: "skillful-figure-388414",
// });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });
// request Hostelchange/////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
exports.hostelChangeRequest = async (req, res) => {
  const currentYear = new Date().getFullYear();
  upload.single("filename")(req, res, async function (err) {
    if (err) {
      console.error("file upload", err);
      return res.status(500).json({ message: "File upload failed" });
    }

    const { targetBlock, targetRoom, reason } = req.body;
    const studentId = req.params.uid;

    try {
      const fileName = req.file ? req.file : null;
      //console.log("file ", fileName);

      console.log(`Uploading ${fileName.filename}...`);
      const filekey = await uploadFile(fileName.path, fileName.filename);

      let block;

      // Check if the specified block exists
      block = await Block.findOne({ _id: targetBlock });
      if (!block) {
        return res.status(404).json({ message: "Block not found" });
      }

      // Check if the specified room exists in the specified block
      const room = await rooms.findOne({
        _id: targetRoom,
        blockid: block._id,
      });
      if (!room) {
        return res
          .status(404)
          .json({ message: "Room not found in specified block" });
      }

      // Check if the logged-in student's current room is in the specified block
      const currentRoom = await Allocate.findOne({
        sid: studentId,
        academicyear: currentYear,
      });

      if (!currentRoom) {
        return res.status(404).json({
          message: "Current room not found for the logged-in student",
        });
      }
      console.log(currentRoom);
      const student_name = currentRoom.student_name;
      const student_email = currentRoom.student_email;
      const student_course = currentRoom.course;
      const student_year = currentRoom.year;
      const student_gender = currentRoom.student_gender;

      // Check if the requested room is available
      if (room.availability === 0) {
        return res
          .status(400)
          .json({ message: "Requested room is not available" });
      }

      const currentBlock = await Block.findOne({ _id: currentRoom.blockid });
      const currentRooms = await rooms.findOne({ _id: currentRoom.roomid });

      const thisyear = new Date().getFullYear();

      // Check if the logged-in student has already made a request to change rooms
      const existingRequest = await Request.findOne({
        student: studentId,
        reqyear: thisyear,
      });
      if (existingRequest) {
        console.log("Request");
        return res.status(500).json({
          message: "You already have a pending request to change rooms",
        });
      }

      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      const curdate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

      // Create a new request object
      const request = new Request({
        student: studentId,
        room: currentRooms._id,
        block: currentBlock._id,
        targetblock: block._id,
        targetroom: room._id,
        Requested: curdate,
        status: "pending",
        Remarks: "requested",
        image: filekey,
        reason: reason,
        student_name: student_name,
        student_email: student_email,
        student_course: student_course,
        student_gender: student_gender,
        student_year: student_year,
        clicked: false,
        reqyear: new Date().getFullYear(),
      });

      // Save the request to the database
      await request.save();

      // Return a success message
      return res.json({ message: "Request submitted successfully" });
    } catch (err) {
      console.error("error ;", err);
      res.status(500).json({ message: "Server error" });
    }
  });
};

///////////////////////
// /////////////////////////////////////////////////////////////////////////////////////
exports.editstudents = async (req, res) => {
  const studentId = req.params.id;

  try {
    const deletedStudent = await Allocate.findOneAndDelete({ sid: studentId });

    if (!deletedStudent) {
      return res.status(404).send({
        message: `Cannot update allocation and remarks for student with sid ${studentId}. Maybe sid is wrong`,
      });
    }

    res.send({
      message: "Student was deleted successfully!",
    });
  } catch (err) {
    //console.error(err);
    res.status(500).send({
      message: "Could not delete student " + studentId,
    });
  }
};

// ///////////search students
// searchStudentsByName/////////////////////////////////////////////////////////////////////

exports.searchStudentsBySID = async (req, res) => {
  const token = req.cookies.tokenABC;
  // const token = JSON.parse(token1);
  const studentSID = req.query.studentSID;

  // //console.log("token", token);
  //console.log(studentSID);

  if (!studentSID) {
    const error = new HttpError("Missing query parameter: studentSID", 400);
    return res.status(error.code || 500).json({ message: error.message });
  }
  //console.log("sedfghjkl;");
  const studentdata = api_students.GetAllStudents();
  // //console.log("students ", studentdata);
  //console.log(typeof JSON.stringify(studentdata));
  //console.log(typeof studentSID);
  const students = studentdata.filter(
    (student) => JSON.stringify(student.sid) == studentSID
  );
  try {
    if (students.length === 0) {
      const error = new HttpError(
        `No students found with the SID '${studentSID}'`,
        404
      );
      return res.status(error.code || 500).json({ message: error.message });
    }
    return res.json(students);
  } catch (e) {
    return res
      .status(error.code || 500)
      .json({ message: "students doesnt exist in thr room" });
  }

  // try {
  //   const response = await axios.get(
  //     `https://gcit-user-management.onrender.com/api/v1/UM/sid/${studentSID}`,
  //     {
  //       headers: {
  //         Authorization: "Bearer " + token,
  //         "Content-Type": "application/json",
  //       },
  //     }
  //   );

  //   const students = response.data;
  //   //console.log(students);
  //   if (students.length === 0) {
  //     const error = new HttpError(
  //       `No students found with the SID '${studentSID}'`,
  //       404
  //     );
  //     return res.status(error.code || 500).json({ message: error.message });
  //   }

  //   res.send(students);
  // } catch (err) {
  //   //console.log(err);
  //   const error = new HttpError(
  //     "Something went wrong, could not search for students",
  //     500
  //   );
  //   return res.status(error.code || 500).json({ message: error.message });
  // }
};

exports.countStudentsByYear = (req, res) => {
  const years = req.params.years;

  const students = api_students.countStudentsByYearDisable(years);

  res.send(students);
};

// delete students
exports.createRemovedStudent = async (req, res) => {
  const student = req.params.students;
  try {
    const { Description } = req.body;

    // Create a new removed student document
    const newRemovedStudent = new removedStudents({
      student: student,
      Description,
      date: new Date(),
    });

    // Save the document to the database
    await newRemovedStudent.save();
    res.status(201).json({
      message: "Removed student successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create removed student" });
  }
};

////////////////////////////////////////////////
//////////////////////////////
exports.getRoomsFromStudent = async (req, res) => {
  const student = req.params.students;
  try {
    // Step 3: Retrieve student's data based on the provided student ID
    // Step 4: Retrieve allocation record(s) associated with the student
    const allocationRecords = await Allocate.find({ sid: student });
    // Step 5: Retrieve room ID(s) allocated to the student

    let roomData = [];
    for (var j = 0; j < allocationRecords.length; j++) {
      roomData.push({
        roomdata: allocationRecords[j].room_name,
        allocationRecords: allocationRecords[j].academicyear,
      });
    }

    res.json({ room: roomData });
  } catch (error) {
    // Handle any errors that occurred during the process
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
