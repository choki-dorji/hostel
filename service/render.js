const axios = require("axios");
const userSession = require("../global");
const request = require("../models/models");
const Request = request.Request;
require("dotenv").config();

// const API = "http://localhost:5000/";
const API = process.env.HOST;
console.log("API: " + API);

exports.add_room = async (req, res) => {
  const token = req.cookies.tokenABC;
  const user = req.cookies.userData;
  const username = JSON.parse(user);
  console.log(username);
  const notificationCount = await Request.countDocuments({ clicked: false });
  axios
    .get(API + "api/blocks")
    .then(function (blockdata) {
      res.render("rooms/add_room", {
        block: blockdata.data,
        token: token,
        notificationCount: notificationCount,
        username: username,
      });
    })
    .catch((err) => {
      res.send(err);
    });
};

exports.getBlock = async (req, res) => {
  const token = req.cookies.tokenABC;
  const user = req.cookies.userData;
  const username = JSON.parse(user);
  console.log("user", typeof user);
  console.log("username ", typeof username);

  const notificationCount = await Request.countDocuments({ clicked: false });
  axios
    .all([axios.get(API + "api/blocks"), axios.get(API + "room/api/rooms")])
    .then(
      axios.spread(function (blocksResponse, roomsResponse) {
        console.log("render username", username);
        res.render("blockd/index", {
          blocks: blocksResponse.data,
          rooms: roomsResponse.data,
          token: token,
          notificationCount: notificationCount,
          username: username,
        });
      })
    )
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
};

exports.getBlocks = async (req, res) => {
  console.log("inside getBlocks");
  const notificationCount = await Request.countDocuments({ clicked: false });
  const token = req.cookies.tokenABC;
  const err = req.query.error;
  const user = req.cookies.userData;
  const username = JSON.parse(user);
  console.log("user", typeof user);
  console.log("username ", typeof username);

  console.log(username, "fghjk");

  const currentYear = new Date().getFullYear();
  console.log("before axios");

  try {
    axios
      .all([
        axios.get(API + "api/blocks"),
        axios.get(API + "room/api/rooms"),
        axios.get(API + "recent/recent"),
        axios.get("https://gcit-user-management.onrender.com/api/v1/UM/join", {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
        }),
      ])
      .then(
        axios.spread(function (
          blocksResponse,
          roomsResponse,
          recent,
          studentResponse
        ) {
          console.log(req.path);
          if (req.path == "/") {
            res.render("blockd/index", {
              blocks: blocksResponse.data,
              rooms: roomsResponse.data,
              students: studentResponse.data,
              username: username,
              notificationCount: notificationCount,
            });
          } else {
            let groupedData = {};
            if (
              studentResponse &&
              studentResponse.data &&
              studentResponse.data.length > 0
            ) {
              groupedData = studentResponse.data.reduce((acc, student) => {
                const year = `year${student.year}`;
                const gender = student.gender;
                if (!acc[year]) {
                  acc[year] = { M: 0, F: 0 };
                }
                acc[year][gender]++;
                return acc;
              }, {});
            }
            console.log("grouped data", groupedData);
            console.log("host", req.hostname);
            res.render("Dashboard/index", {
              blocks: blocksResponse.data,
              rooms: roomsResponse.data,
              students: studentResponse.data,
              recentactivity: recent.data,
              username: username,
              token: token,
              chart: groupedData,
              notificationCount: notificationCount,
            });
          }
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
// Allocations

exports.getAllocations = async (req, res) => {
  const currentYear = new Date().getFullYear();
  const token = req.cookies.tokenABC;
  const user = req.cookies.userData;
  const username = JSON.parse(user);
  const notificationCount = await Request.countDocuments({ clicked: false });

  axios
    .all([
      axios.get(`http://localhost:5000/api/allocations/${currentYear}`),
      axios.get(API + "api/students"),
    ])
    .then(
      axios.spread((allocationsResponse, studentsResponse) => {
        const allocations = allocationsResponse.data;
        const students = studentsResponse.data;
        const studentIds = allocations
          .filter((allocation) => allocation.blockId === blockId)
          .map((allocation) => allocation.studentId);
        const studentCount = studentIds.length;

        res.render("block", {
          studentCount,
          token: token,
          notificationCount: notificationCount,
          username: username,
        });
      })
    )
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
};
// %55555555555555555555555555555555555555555555555%%%%%%%%%%%%%%%%%%%%%%%%5

exports.getBlockById = async (req, res) => {
  const token = req.cookies.tokenABC;
  const blockId = req.query.id;
  const currentYear = new Date().getFullYear();
  const user = req.cookies.userData;
  const username = JSON.parse(user);
  const notificationCount = await Request.countDocuments({ clicked: false });

  Promise.all([
    axios.get(`http://localhost:5000/api/blocks/${blockId}`),
    axios.get(`http://localhost:5000/room/api/rooms?blockId=${blockId}`),
    axios.get(`http://localhost:5000/allocate/api/years/${currentYear}`),
  ])
    .then((responses) => {
      const blockData = responses[0].data;
      const roomsData = responses[1].data;
      const allocation = responses[2].data;
      console.log("allocations", allocation);
      res.render("blockd/viewBlockDetail", {
        block: blockData,
        rooms: roomsData,
        token: token,
        allocate: allocation,
        notificationCount: notificationCount,
        username: username,
      });
    })
    .catch((err) => {
      res.send(err);
    });
};

exports.update_block = async (req, res) => {
  const token = req.cookies.tokenABC;
  const user = req.cookies.userData;
  const username = JSON.parse(user);
  const notificationCount = await Request.countDocuments({ clicked: false });
  axios
    .get(API + "api/blocks", { params: { id: req.query.id } })
    .then(function (blockdata) {
      res.render("blockd/index", {
        block: blockdata.data,
        token: token,
        notificationCount: notificationCount,
        username: username,
      });
    })
    .catch((err) => {
      res.send(err);
    });
};

// //////////////////////////////////////////////////
//////////////////////////////////////////////////////
/////////////////Rooms /////////////////////////

// get rooms
exports.getRooms = async (req, res) => {
  const token = req.cookies.tokenABC;
  const user = req.cookies.userData;
  const username = JSON.parse(user);
  const notificationCount = await Request.countDocuments({ clicked: false });
  // Make a get request to /api/users
  axios
    .get(API + "room/api/rooms")
    .then(function (response) {
      // console.log(response);
      res.render("getroom", {
        room: response.data,
        token: token,
        notificationCount: notificationCount,
        username: username,
      });
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
};
// getallocation
exports.getAllocationbyId = async (req, res) => {
  const year = req.query.year;
  console.log(year);
  const token = req.cookies.tokenABC;
  const user = req.cookies.userData;
  const username = JSON.parse(user);

  const notificationCount = await Request.countDocuments({ clicked: false });

  axios
    .get(`http://localhost:5000/allocate/api/years/${year}`)
    .then((responses) => {
      const blockData = responses.data;
      console.log("data", blockData);
      res.render("Allocation/allocate", {
        allocate: blockData,
        token: token,
        notificationCount: notificationCount,
        username: username,
      });
    })
    .catch((err) => {
      res.send(err);
    });
};

// uodate
exports.update_room = async (req, res) => {
  const token = req.cookies.tokenABC;
  const username = req.cookies.userData;
  const notificationCount = await Request.countDocuments({ clicked: false });
  axios
    .get(API + "room/api/rooms", {
      params: { id: req.query.id },
    })
    .then(function (blockdata) {
      res.render("update_room", {
        room: blockdata.data,
        token: token,
        notificationCount: notificationCount,
        username: username,
      });
    })
    .catch((err) => {
      res.send(err);
    });
};

// /////////////////////////////////////////////
/////////////////////////////////////////////////
///////////YEAR//////////////////////////////////
exports.add_year = (req, res) => {
  res.render("add_year");
};

// Allocattion
exports.add_Allocation = (req, res) => {
  res.render("add_Allocation");
};

////////////////////////////////
/////////// chart ...///////////

exports.getchart = async (req, res) => {
  // Make a get request to /api/users
  const username = req.cookies.userData;
  axios
    .get(API + "chart")
    .then(function (response) {
      // Get the data passed from the server-side
      const groupedData = response.data;

      // Convert the grouped data to an array of objects
      const chartData = Object.entries(groupedData).map(([year, data]) => {
        return {
          year: year.slice(4), // remove the "year" prefix from the key
          male: data.male,
          female: data.female,
        };
      });

      // Create a new Chart.js instance
      const ctx = document.getElementById("chart").getContext("2d");
      const chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: chartData.map((d) => "year " + d.year),
          datasets: [
            {
              label: "Male",
              backgroundColor: "rgba(255, 75, 19, 0.3)",
              borderColor: "#ff4b13",
              borderWidth: 1,
              data: chartData.map((d) => d.male),
            },
            {
              label: "Female",
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              borderColor: "#000000",
              borderWidth: 1,
              data: chartData.map((d) => d.female),
            },
          ],
        },
        options: {
          title: {
            display: true,
            text: "Students by Year and Gender",
          },
          scales: {
            xAxes: [
              {
                stacked: true,
              },
            ],
            yAxes: [
              {
                stacked: true,
                ticks: {
                  beginAtZero: true,
                },
              },
            ],
          },
        },
      });

      res.render("Dashboard/index", { chart: chartData });
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
};

// search room
exports.search_room = async (req, res) => {
  const token = req.cookies.tokenABC;
  const user = req.cookies.userData;
  const username = JSON.parse(user);
  const host = req.hostname;
  const notificationCount = await Request.countDocuments({ clicked: false });

  axios
    .all([
      axios.get(API + "room/api/rooms", {
        params: { id: req.query.id },
      }),
      axios.get(`${API}allocate/all`),
    ])
    .then(
      axios.spread(function (blocksResponse, roomsResponse) {
        // console.log(req.path);
        // console.log("member ", allocationsResponse.data);
        res.render("search/searchroom", {
          room: blocksResponse.data,
          all: roomsResponse.data,
          username: username,
          notificationCount: notificationCount,
          token: token,
          host: host,
        });
      })
    )
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
};
exports.displaycreateallocation = async function (req, res) {
  const currentYear = new Date().getFullYear();
  const year = req.query.year;
  const token = req.cookies.tokenABC;
  const user = req.cookies.userData;
  const username = JSON.parse(user);
  const notificationCount = await Request.countDocuments({ clicked: false });

  Promise.all([
    axios.get(API + "api/blocks"),
    axios.get(API + "allocate/all"),
    axios.get(API + "room/api/rooms"),
    axios.get(API + "students/allstudents"),
  ])
    .then((responses) => {
      const block_ = [];
      const blockData = responses[0].data;
      const allocation = responses[1].data;
      const roomresponse = responses[2].data;
      const studentResponse = responses[3].data;

      for (var i = 0; i < allocation.length; i++) {
        block_.push(allocation[i].blockid);
      }
      // console.log("allocations", allocation);
      res.render("Allocation/createalllocation", {
        block: blockData,
        allocate: allocation,
        blocks: block_,
        token: token,
        year: year,
        room: roomresponse,
        students: studentResponse,
        notificationCount: notificationCount,
        username: username,
      });
    })
    .catch((err) => {
      res.send(err);
    });
};
exports.search_roompage = async function (req, res) {
  const token = req.cookies.tokenABC;
  const username = req.cookies.userData;
  const user = JSON.parse(user);
  res.render("search/searchroom", { token: token, username: username });
};

exports.getWholeAllocationYear = async function (req, res) {
  const year = req.query.year;
  const token = req.cookies.tokenABC;
  const user = req.cookies.userData;
  const username = JSON.parse(user);
  const notificationCount = await Request.countDocuments({ clicked: false });

  Promise.all([
    axios.get(`http://localhost:5000/year/allocations`),
    axios.get(`http://localhost:5000/Allocate//api/years/${year}`),
    axios.get(`http://localhost:5000/room/api/rooms`),
    axios.get(`http://localhost:5000/api/blocks`),
    axios.get(`http://localhost:5000/year/allocations`),
  ])
    .then((responses) => {
      const yearData = responses[0].data;
      const AllocateData = responses[1].data;
      const room = responses[2].data;
      const blocks = responses[3].data;
      res.render("Allocation/index", {
        Acad: yearData,
        allocate: AllocateData,
        room: room,
        blocks: blocks,
        token,
        token,
        notificationCount: notificationCount,
        username: username,
      });
    })
    .catch((err) => {
      res.send(err);
    });
};

exports.disable = async (req, res) => {
  const currentYear = new Date().getFullYear();
  const token = req.cookies.tokenABC;
  const user = req.cookies.userData;
  const username = JSON.parse(user);
  const notificationCount = await Request.countDocuments({ clicked: false });
  Promise.all([
    axios.get(`${API}api/blocks`),
    axios.get(`${API}allocate/api/years/${currentYear}`),
    axios.get(API + "room/api/rooms"),
    axios.get(API + "Allocate/getMaleDisable"),
    axios.get(API + "Allocate/getFemaleDisable"),
  ])
    .then((responses) => {
      const blockData = responses[0].data;
      const allocation = responses[1].data;
      const roomresponse = responses[2].data;
      const maleDisable = responses[3].data;
      const femaleDisable = responses[4].data;
      // console.log("maleee ", maleDisable.Male);
      console.log("allocations", allocation);
      res.render("disability/index", {
        block: blockData,
        allocate: allocation,
        token: token,
        room: roomresponse,
        notificationCount: notificationCount,
        username: username,
        disableMale: maleDisable.Male,
      });
    })
    .catch((err) => {
      res.send(err);
    });
};

exports.disableF = async (req, res) => {
  const currentYear = new Date().getFullYear();
  const token = req.cookies.tokenABC;
  const user = req.cookies.userData;
  const username = JSON.parse(user);
  const notificationCount = await Request.countDocuments({ clicked: false });
  Promise.all([
    axios.get(`${API}api/blocks`),
    axios.get(`${API}allocate/api/years/${currentYear}`),
    axios.get(API + "room/api/rooms"),
    axios.get(API + "Allocate/getFemaleDisable"),
  ])
    .then((responses) => {
      const blockData = responses[0].data;
      const allocation = responses[1].data;
      const roomresponse = responses[2].data;
      const femaleDisable = responses[3].data;
      // console.log("allocations", allocation);
      res.render("disability/indexfemale", {
        block: blockData,
        allocate: allocation,
        token: token,
        room: roomresponse,
        notificationCount: notificationCount,
        username: username,
        disableFemale: femaleDisable.Female,
      });
    })
    .catch((err) => {
      res.send(err);
    });
};

exports.search_roomNav = async (req, res) => {
  console.log("inside getBlocks");
  const notificationCount = await Request.countDocuments({ clicked: false });
  const token = req.cookies.tokenABC;
  const err = req.query.error;
  const user = req.cookies.userData;
  const username = JSON.parse(user);
  console.log("before axios");
  const urlParams = new URLSearchParams(req._parsedUrl.search);
  const id = urlParams.get("id");
  console.log("id", id);

  try {
    axios
      .all([
        axios.get(API + "api/blocks"),
        axios.get(API + "room/api/rooms"),
        axios.get(API + "recent/recent"),
      ])
      .then(
        axios.spread(function (blocksResponse, roomsResponse, studentResponse) {
          console.log(req.path);
          res.render("blockd/block-details", {
            blocks: blocksResponse.data,
            rooms: roomsResponse.data,
            username: username,
            notificationCount: notificationCount,
            token: token,
            // username: username,
            id: id,
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

exports.search_room01 = async (req, res) => {
  const notificationCount = await Request.countDocuments({ clicked: false });
  const token = req.cookies.tokenABC;
  const err = req.query.error;
  const user = req.cookies.userData;
  const username = JSON.parse(user);
  console.log("before axios");
  const urlParams = new URLSearchParams(req._parsedUrl.search);
  const id = urlParams.get("id");
  console.log("id", id);

  try {
    axios
      .all([
        axios.get(API + "api/blocks"),
        axios.get(API + "room/api/rooms"),
        axios.get(`${API}room/api/member/${id}`),
      ])
      .then(
        axios.spread(function (blocksResponse, roomsResponse, membersResponse) {
          console.log(req.path);
          console.log("member ", membersResponse.data);
          res.render("rooms/room-details", {
            blocks: blocksResponse.data,
            rooms: roomsResponse.data,
            username: username,
            notificationCount: notificationCount,
            token: token,
            id: id,
            members: membersResponse.data,
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

////////////////////////////////////////////////////////////////////
// exports.getHistory = async (req, res) => {
//   const notificationCount = await Request.countDocuments({ clicked: false });
//   const token = req.cookies.tokenABC;
//   const err = req.query.error;
//   const user = req.cookies.userData;
//   const username = JSON.parse(user);
//   console.log("before axios");

//   Promise.all([
//     axios.get(`${API}api/blocks`),
//     axios.get(`${API}request/api/request`),
//     axios.get(API + "room/api/rooms"),
//   ])
//     .then((responses) => {
//       const blockData = responses[0].data;
//       const request = responses[1].data;
//       const roomresponse = responses[2].data;
//       res.render("Request/requestHistory", {
//         block: blockData,
//         request: request,
//         token: token,
//         room: roomresponse,
//         notificationCount: notificationCount,
//         username: username,
//         disableFemale: femaleDisable.Female,
//       });
//     })
//     .catch((err) => {
//       res.send(err);
//     });
// };

exports.detailsrequest = async function (req, res) {
  const notificationCount = await Request.countDocuments({ clicked: false });
  const token = req.cookies.tokenABC;
  const err = req.query.error;
  const urlParams = new URLSearchParams(req._parsedUrl.search);
  const user = req.cookies.userData;
  const username = JSON.parse(user);
  console.log("before axios");
  const sid = urlParams.get("sid");
  console.log("sid", sid);

  try {
    axios
      .all([
        axios.get(API + "api/blocks"),
        axios.get(API + "room/api/rooms"),
        axios.get(`${API}request/getreqbySid/${sid}`),
      ])
      .then(
        axios.spread(function (blocksResponse, roomsResponse, membersResponse) {
          console.log(req.path);
          console.log(membersResponse.data[0]);
          res.render("Request/DetailsRequest", {
            block: blocksResponse.data,
            rooms: roomsResponse.data,
            username: username,
            notificationCount: notificationCount,
            token: token,
            request: membersResponse.data[0],
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

  // res.render("", {
  //   notificationCount: notificationCount,
  //   token: token,
  //   username: username,
  // });
};

exports.langing = (req, res) => {
  res.render("landingpage");
};

exports.usermanual = (req, res) => {
  res.render("usermanual/index");
};

exports.resetpassword = (req, res) => {
  res.render("Login/forgetpassword");
};

exports.successreset = (req, res) => {
  res.render("Login/success_send");
};
