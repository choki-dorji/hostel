const axios = require("axios");
const request = require("../models/models");
const Request = request.Request;

exports.StudentDashboard = (req, res) => {
  // calling student to get their detail
  const userdata = req.cookies.userData;
  const user = JSON.parse(userdata);

  const currentYear = new Date().getFullYear();
  console.log(user);

  axios
    .all([
      axios.get("http://localhost:5000/api/blocks"),
      axios.get(`http://localhost:5000/students/get-roommate/${user.sid}`),
      axios.get("http://localhost:5000/room/api/rooms"),
      axios.get(`http://localhost:5000/allocate/api/years/${currentYear}`),
    ])
    .then(
      axios.spread(function (blocksResponse, roomsResponse, room, allocate) {
        res.render("students/index", {
          userdata: user,
          block: blocksResponse.data,
          roommate: roomsResponse.data,
          room: room.data,
          allocate: allocate.data,
        });
      })
    )
    .catch((err) => {
      console.log(err);
      res.send(err);
    });

  // calling to get Roommate
};

///////////////////////////////////////////////
exports.search_student = async (req, res) => {
  const token = req.cookies.tokenABC;
  const username = req.cookies.userData;
  const notificationCount = await Request.countDocuments({ clicked: false });
  const urlParams = new URLSearchParams(req._parsedUrl.search);
  const id = urlParams.get("id");
  console.log("id", id);
  const currentYear = new Date().getFullYear();

  try {
    axios
      .all([
        axios.get("http://localhost:5000/api/blocks"),
        axios.get("http://localhost:5000/room/api/rooms"),
        axios.get(`http://localhost:5000/students/search?studentSID=${id}`),
        axios.get(`http://localhost:5000/allocate/api/years/${currentYear}`),
      ])
      .then(
        axios.spread(function (
          blocksResponse,
          roomsResponse,
          membersResponse,
          allocationsResponse
        ) {
          // console.log(req.path);
          console.log("member ", allocationsResponse.data);
          res.render("students/student-details", {
            blocks: blocksResponse.data,
            rooms: roomsResponse.data,
            username: username,
            notificationCount: notificationCount,
            token: token,
            id: id,
            students: membersResponse.data,
            allocate: allocationsResponse.data,
          });
        })
      )
      .catch((err) => {
        console.log(err);
        res.send(err);
      });
  } catch (e) {
    console.log(e);
  }
};
