const mongoose = require("mongoose");
const HttpError = require("../models/httperror");
const database = require("../models/models");
const Room = database.Room;
const Block = database.Block;
const Allocate = database.Allocation;

// create
exports.createRoom = async (req, res) => {
  console.log("createRoom");
  if (!req.body) {
    res.status(400).send({ message: "Content can not be emtpy!" });
    return;
  }
  const { room_name, room_capacity, isDisabled, status, blockid } = req.body;
  console.log(room_name, room_capacity, isDisabled, status, blockid);
  let existingRoom;
  try {
    existingRoom = await Room.findOne({ room_name: room_name });
  } catch (err) {
    const error = new HttpError("sth Failed, try again later", 500);
    return res.status(error.code || 500).json({ message: error.message });
  }

  if (existingRoom) {
    const error = new HttpError("room  already exists", 422);
    return res.status(error.code || 500).json({ message: error.message });
  }

  let block;
  try {
    block = await Block.findById(blockid);
    console.log(block);
  } catch (e) {
    console.log(e);
    const error = new HttpError("block with provided name is not found", 500);
    return res.status(error.code || 500).json({ message: error.message });
  }

  if (!block) {
    const error = new HttpError("could not find block for the id", 404);
    return res.status(error.code || 500).json({ message: error.message });
  }
  if (block.rooms.length === block.block_capacity) {
    const error = new HttpError("cannot create new", 422);
    return res.status(error.code || 500).json({ message: error.message });
  }
  const createdRoom = new Room({
    room_name: room_name,
    room_capacity: room_capacity,
    member: [],
    availability: room_capacity,
    blockid: blockid,
    window: 4,
    isDisabled: isDisabled,
    type: block.type,
    status: status, // assign the type of block to the type of room
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdRoom.save({ session: sess });
    block.rooms.push(createdRoom);
    block.no_of_rooms += 1;
    await block.save({ session: sess });
    await sess.commitTransaction();
    res.status(201).json({ message: "room created successfully" });
  } catch (err) {
    console.log(err);
    const error = new HttpError("Creating room failed, please try again", 500);
    return res.status(error.code || 500).json({ message: error.message });
  }
};
// read
exports.getRoom = async (req, res, next) => {
  let rooms;
  try {
    rooms = await Room.find({});
  } catch (err) {
    const error = new HttpError(
      "something went wrong, could not find a room",
      500
    );
    return res.status(error.code || 500).json({ message: error.message });
  }
  // res.json({ rooms: rooms.map((room) => room.toObject({ getters: true })) });
  res.send(rooms);
};
// update
exports.update_room = (req, res) => {
  // console.log("inside uodate");
  if (!req.body) {
    return res.status(400).send({ message: "Data to update can not be empty" });
  }

  const id = req.params.id;
  // console.log(id);
  Room.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot Update user with ${id}. Maybe user not found!`,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({ message: "Error Update user information" });
    });
};

// delete
exports.delete = async (req, res) => {
  const id = req.params.id;

  // Find the room to be deleted
  const room = await Room.findById(id);

  if (!room) {
    return res.status(404).json({ message: "Room not found" });
  }

  // Remove the room's ID from the corresponding block document
  const block = await Block.findById(room.blockid);
  block.rooms.pull(id);
  await block.save();

  Room.findByIdAndDelete(id)
    .then((data) => {
      if (!data) {
        res
          .status(404)
          .send({ message: `Cannot Delete with id ${id}. Maybe id is wrong` });
      } else {
        res.send({
          message: "room was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete room with id=" + id,
      });
    });
};

// searchRoom
// searchRoom
exports.searchRoom = async (req, res) => {
  const roomName = req.query.room_name;
  if (!roomName) {
    const error = new HttpError("Missing query parameter: room_name", 400);
    return res.status(error.code || 500).json({ message: error.message });
  }

  let room;
  try {
    room = await Room.findOne({ room_name: roomName });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not search for room",
      500
    );
    return res.status(error.code || 500).json({ message: error.message });
  }

  if (!room) {
    const error = new HttpError("Room not found", 404);
    return res.status(error.code || 500).json({ message: error.message });
  }

  res.json({ room: room.toObject({ getters: true }) });
};
////////////////////////////////////////////////////////////////




//
exports.getRoomByBlockId = async (req, res, next) => {
  const blockId = req.params.id;

  let rooms;
  try {
    rooms = await Room.find({ blockid: blockId });
  } catch (err) {
    const error = new HttpError("fetching room failed", 500);
    // return next(error)
    return res.status(error.code || 500).json({ message: error.message });
  }

  if (!rooms || rooms.length === 0) {
    const error = new HttpError(
      "Couldn't find a room for the provided user id",
      404
    );
    return res.status(error.code || 500).json({ message: error.message });
  }
  // res.json({ room: rooms.map((place) => place.toObject({ getters: true })) });
  res.send(rooms);
};

// exports.getMembersIRoom = async (req, res) => {
//   const roomid = req.params.id;
//   const year= new Date().getFullYear();

//   let members;
//   try{
//     members = Allocate.find({roomid : roomid, academicyear: year });
//   }catch(e){
//      const error = new HttpError("fetching Allocation failed", 500);
//     // return next(error)
//     return res.status(error.code || 500).json({ message: error.message });
//   }

//   if (!members){
//       const error = new HttpError("Search Not found", 500);
//     // return next(error)
//     return res.status(error.code || 500).json({ message: error.message });
//   }

//   return res.json(members)

// }
// const Allocation = require('../models/allocation'); // Assuming you have a model named 'Allocation'

// Controller function to get members in a room for the current year
exports.getMembersIRoom = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear(); // Get the current year

    // Find allocations for the current year
    const allocations = await Allocate.find({ academicyear: currentYear });

    console.log(allocations);

    // Find the members in the specified room
    const roomId = req.params.id; // Assuming you pass the roomId as a parameter
    const membersInRoom = allocations.filter(
      (allocation) => String(allocation.roomid) === roomId
    );

    res.status(200).json({ membersInRoom });
  } catch (error) {
    console.error("Error retrieving members in room:", error);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving members in room" });
  }
};
