const axios = require("axios");
const userSession = require("../global");
const request = require("../models/models");
const Request = request.Request;

exports.add_room = async (req, res) => {
  const token = req.cookies.tokenABC;
  const user = req.cookies.userData;
  const username = JSON.parse(user);
  const notificationCount = await Request.countDocuments({ clicked: false });
  axios
    .get("http://localhost:5000/api/blocks")
    .then(function (blockdata) {
      res.render("rooms/add_room", {
        block: blockdata.data,
        token: token,
        notificationCount: notificationCount,
        username: username.name,
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
  const notificationCount = await Request.countDocuments({ clicked: false });
  axios
    .all([
      axios.get("http://localhost:5000/api/blocks"),
      axios.get("http://localhost:5000/room/api/rooms"),
    ])
    .then(
      axios.spread(function (blocksResponse, roomsResponse) {
        res.render("blockd/index", {
          blocks: blocksResponse.data,
          rooms: roomsResponse.data,
          token: token,
          notificationCount: notificationCount,
          username: username.name,
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
  const token = req.query.token;
  const err = req.query.error;
  const username = req.cookies.userData;
  // const username = JSON.parse(user);

  console.log(username, "fghjk");

  const currentYear = new Date().getFullYear();
  console.log("before axios");

  try {
    axios
      .all([
        axios.get("http://localhost:5000/api/blocks"),
        axios.get("http://localhost:5000/room/api/rooms"),
        axios.get("http://localhost:5000/recent/recent"),
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
      axios.get("http://localhost:5000/api/students"),
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
          username: username.name,
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
  const username = req.cookies.userData;
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
  const username = req.cookies.userData;
  const notificationCount = await Request.countDocuments({ clicked: false });
  axios
    .get("http://localhost:5000/api/blocks", { params: { id: req.query.id } })
    .then(function (blockdata) {
      res.render("blockd/index", {
        block: blockdata.data,
        token: token,
        notificationCount: notificationCount,
        username: username.name,
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
  const username = req.cookies.userData;
  const notificationCount = await Request.countDocuments({ clicked: false });
  // Make a get request to /api/users
  axios
    .get("http://localhost:5000/room/api/rooms")
    .then(function (response) {
      // console.log(response);
      res.render("getroom", {
        room: response.data,
        token: token,
        notificationCount: notificationCount,
        username: username.name,
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
  const username = req.cookies.userData;
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
        username: username.name,
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
    .get("http://localhost:5000/room/api/rooms", {
      params: { id: req.query.id },
    })
    .then(function (blockdata) {
      res.render("update_room", {
        room: blockdata.data,
        token: token,
        notificationCount: notificationCount,
        username: username.name,
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
    .get("http://localhost:5000/chart")
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
  const username = req.cookies.userData;
  const notificationCount = await Request.countDocuments({ clicked: false });
  axios
    .get("http://localhost:5000/room/api/rooms", {
      params: { id: req.query.id },
    })
    .then(function (blockdata) {
      res.render("search/searchroom", {
        room: blockdata.data,
        token: token,
        username: username,
        notificationCount: notificationCount,
      });
    })
    .catch((err) => {
      res.send(err);
    });
};

exports.displaycreateallocation = async function (req, res) {
  const currentYear = new Date().getFullYear();
  const year = req.query.year;
  const token = req.cookies.tokenABC;
  const username = req.cookies.userData;
  const notificationCount = await Request.countDocuments({ clicked: false });

  Promise.all([
    axios.get(`http://localhost:5000/api/blocks`),
    axios.get(`http://localhost:5000/allocate/all`),
    axios.get("http://localhost:5000/room/api/rooms"),
    axios.get(`http://localhost:5000/students/allstudents`),
  ])
    .then((responses) => {
      const blockData = responses[0].data;
      const allocation = responses[1].data;
      const roomresponse = responses[2].data;
      const studentResponse = responses[3].data;
      console.log("allocations", allocation);
      res.render("Allocation/createalllocation", {
        block: blockData,
        allocate: allocation,
        token: token,
        year: year,
        room: roomresponse,
        students: studentResponse,
        notificationCount: notificationCount,
        username: username.name,
      });
    })
    .catch((err) => {
      res.send(err);
    });
};
exports.search_roompage = async function (req, res) {
  const token = req.cookies.tokenABC;
  const username = req.cookies.userData;
  res.render("search/searchroom", { token: token, username: username });
};

exports.getWholeAllocationYear = async function (req, res) {
  const year = req.query.year;
  const token = req.cookies.tokenABC;
  const username = req.cookies.userData;
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
        username: username.name,
      });
    })
    .catch((err) => {
      res.send(err);
    });
};

exports.disable = async (req, res) => {
  const currentYear = new Date().getFullYear();
  const token = req.cookies.tokenABC;
  const username = req.cookies.userData;
  const notificationCount = await Request.countDocuments({ clicked: false });
  Promise.all([
    axios.get(`http://localhost:5000/api/blocks`),
    axios.get(`http://localhost:5000/allocate/api/years/${currentYear}`),
    axios.get("http://localhost:5000/room/api/rooms"),
  ])
    .then((responses) => {
      const blockData = responses[0].data;
      const allocation = responses[1].data;
      const roomresponse = responses[2].data;
      console.log("allocations", allocation);
      res.render("disability/index", {
        block: blockData,
        allocate: allocation,
        token: token,
        room: roomresponse,
        notificationCount: notificationCount,
        username: username.name,
      });
    })
    .catch((err) => {
      res.send(err);
    });
};

exports.disableF = async (req, res) => {
  const currentYear = new Date().getFullYear();
  const token = req.cookies.tokenABC;
  const username = req.cookies.userData;
  const notificationCount = await Request.countDocuments({ clicked: false });
  Promise.all([
    axios.get(`http://localhost:5000/api/blocks`),
    axios.get(`http://localhost:5000/allocate/api/years/${currentYear}`),
    axios.get("http://localhost:5000/room/api/rooms"),
  ])
    .then((responses) => {
      const blockData = responses[0].data;
      const allocation = responses[1].data;
      const roomresponse = responses[2].data;
      console.log("allocations", allocation);
      res.render("disability/indexfemale", {
        block: blockData,
        allocate: allocation,
        token: token,
        room: roomresponse,
        notificationCount: notificationCount,
        username: username.name,
      });
    })
    .catch((err) => {
      res.send(err);
    });
};

exports.search_roomNav = async (req, res) => {
  console.log("inside getBlocks");
  const notificationCount = await Request.countDocuments({ clicked: false });
  const token = req.query.token;
  const err = req.query.error;
  const username = req.cookies.userData;
  console.log("before axios");
  const urlParams = new URLSearchParams(req._parsedUrl.search);
  const id = urlParams.get("id");
  console.log("id", id);

  try {
    axios
      .all([
        axios.get("http://localhost:5000/api/blocks"),
        axios.get("http://localhost:5000/room/api/rooms"),
        axios.get("http://localhost:5000/recent/recent"),
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
  const token = req.query.token;
  const err = req.query.error;
  const username = req.cookies.userData;
  console.log("before axios");
  const urlParams = new URLSearchParams(req._parsedUrl.search);
  const id = urlParams.get("id");
  console.log("id", id);

  try {
    axios
      .all([
        axios.get("http://localhost:5000/api/blocks"),
        axios.get("http://localhost:5000/room/api/rooms"),
        axios.get(`http://localhost:5000/room/api/member/${id}`),
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
