const allocateRoomByYearAndBlock = async (req, res, next) => {
  currentYear = req.params.year;
  const { years, maleBlock, femaleBlock } = req.body;
  const bid = [...maleBlock, ...femaleBlock];

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const day = currentDate.getDate();

  const x = await Allocate.countDocuments();

  if (x > 0) {
    const existingAllocation = await Allocate.findOne({
      year: years,
      blockid: { $in: bid },
      academicyear: currentYear,
    });

    if (existingAllocation) {
      const error = new HttpError(
        `Rooms have already allocated for year ${years} in block `,
        409
      );
      return res.status(error.code || 500).json({ message: error.message });
    }
  }
  const allocatedRoomIds = (await Allocate.find({ year: currentYear })).map(
    (allocation) => allocation.roomid
  );
  const rooms = await Room.find();
  for (const room of rooms) {
    if (!allocatedRoomIds.includes(room._id)) {
      const room_capacity = room.room_capacity;
      await Room.updateOne(
        { _id: room._id },
        { $set: { availability: room_capacity, members: [] } }
      );
    }
  }
  try {
    const veriifyYear = AcadYear.findOne({ Year: currentYear });
  } catch (e) {
    const error = new HttpError(`Invalid Operation`, 409);
    return res.status(error.code || 500).json({ message: error.message });
  }

  try {
    //*********************getting student Data****************************** */
    const students = await student.GetStudents(req, res, years);

    console.log(students);
    //**********************************grouping students into course******************* */
    const courseGroups = students.reduce((groups, student) => {
      const existingGroup = groups.find(
        (group) => group.key === student.specialization
      );
      if (existingGroup) {
        existingGroup.students.push(student);
      } else {
        groups.push({
          key: student.specialization,
          students: [student],
        });
      }
      return groups;
    }, []);

    console.log(courseGroups);
    //******************************** initialize male and female block ************** */
    const maleBlocks = await Block.find({ _id: { $in: maleBlock } }).populate(
      "rooms"
    );
    const femaleBlocks = await Block.find({
      _id: { $in: femaleBlock },
    }).populate("rooms");

    //************************************* get total students either male or female in partivular course****** */
    let maleLength;
    let femaleLength;
    let maleStudents;
    let femaleStudents;

    for (const courseGroup of courseGroups) {
      maleStudents = courseGroup.students.filter((s) => s.gender === "M");
      femaleStudents = courseGroup.students.filter((s) => s.gender === "F");
      maleLength = maleStudents.length;
      femaleLength = femaleStudents.length;
    }
    console.log("male", maleLength);
    console.log("female", femaleLength);

    //************************************* get total capacity of the block  *********************** */

    console.log("allocation start");
    let blockId;
    let rooms;

    const blocks = [...maleBlocks, ...femaleBlocks];

    for (const block of blocks) {
      blockName = block.block_name;
      blockId = block._id;
      rooms = block.rooms;

      console.log(blockName);
      console.log("rooms", rooms);
      console.log("allocation start, finding total capacity");
      let totalCapacity = 0;
      console.log("allocation start, initialize capacity");

      for (const room of rooms) {
        const populatedRoom = await Room.findById(room._id);
        totalCapacity += populatedRoom.availability;
      }
      console.log("allocation start, finished room");

      if (totalCapacity > maleLength || totalCapacity > femaleLength) {
        for (const student of [...maleStudents, ...femaleStudents]) {
          // Check if the student has already been allocated to a room
          const existingAllocation = await Allocate.findOne({
            student: student._id,
            AcadYear: currentYear,
          });
          console.log("inside for loop & if");
          if (existingAllocation) {
            console.log(
              `Skipping ${student.name}, already allocated to room ${existingAllocation.room}`
            );
            continue;
          }
          console.log("finished for");

          let room;
          console.log("starting for");

          for (const r of rooms) {
            console.log("r", r);
            const roomObj = await Room.findById(r._id);
            console.log("roomObj", roomObj);
            if (
              ((student.gender === "M" && roomObj.type === "boys") ||
                (student.gender === "F" && roomObj.type === "girls")) &&
              roomObj.availability > 0 &&
              roomObj.isDisabled === false &&
              roomObj.status === "available"
            ) {
              room = r;
              break;
            }
          }
          console.log("allocation start, if loop");
          if (room) {
            console.log("room is found");
            try {
              await Room.findByIdAndUpdate(room, {
                $inc: { availability: -1 },
              });
              console.log(
                `Allocated ${student.name} to room ${room.room_name}`
              );
            } catch (e) {}
            console.log("current year", currentYear);
            const allocate = new Allocate({
              student: student.id,
              student_name: student.name,
              roomid: room._id,
              room_name: room.room_name,
              year: years,
              blockid: blockId,
              block_name: blockName,
              course: student.specialization,
              academicyear: currentYear,
              sid: student.sid,
              student_gender: student.gender,
              isDisabled: student.isDisabled,
              student_email: student.email,
              created: `${day}/${month}/${year}`,
            });

            try {
              await allocate.save();
            } catch (err) {
              console.error(err);
            }
          }
          console.log("room is not found");
        }
      } else {
        return res
          .status(404)
          .json({ message: "couldnot allocate rooms, select more blocks" });
      }

      // console.log(
      //   `there are ${totalCapacity} available in ${block.block_name} of ${block.type}`
      // );
    }
    return res.status(201).json({ message: "Rooms allocated successfully" });

    //*************************************  check if the total capacity of the block was more or less than student length ************************************** */
  } catch (error) {
    console.log(error);
    return res.status(error.code || 500).json({ message: error.message });
  }
};


// /////

console.log("allocation start");
let blockId;
let rooms;

const blocks = [...maleBlocks, ...femaleBlocks];

for (const block of blocks) {
  blockName = block.block_name;
  blockId = block._id;
  rooms = block.rooms;

  console.log(blockName);
  console.log("rooms", rooms);
  console.log("allocation start, finding total capacity");
  let totalCapacity = 0;
  console.log("allocation start, initialize capacity");

  for (const room of rooms) {
    const populatedRoom = await Room.findById(room._id);
    totalCapacity += populatedRoom.availability;
  }
  console.log("allocation start, finished room");

  if (totalCapacity > maleLength || totalCapacity > femaleLength) {
    for (const student of [...maleStudents, ...femaleStudents]) {
      // Check if the student has already been allocated to a room
      const existingAllocation = await Allocate.findOne({
        student: student.sid,
        academicyear: currentYear,
      });
      console.log("inside for loop & if");
      if (existingAllocation) {
        console.log(
          `Skipping ${student.name}, already allocated to room ${existingAllocation.room}`
        );
        continue;
      }
      console.log("finished for");

      let room;
      console.log("starting for");

      for (const r of rooms) {
        console.log("r", r);
        const roomObj = await Room.findById(r._id);
        console.log("roomObj", roomObj);
        if (
          ((student.gender === "M" && roomObj.type === "boys") ||
            (student.gender === "F" && roomObj.type === "girls")) &&
          roomObj.availability > 0 &&
          roomObj.isDisabled === false &&
          roomObj.status === "available"
        ) {
          room = r;
          break;
        }
      }
      console.log("allocation start, if loop");
      if (room) {
        console.log("room is found");
        try {
          await Room.findByIdAndUpdate(room, {
            $inc: { availability: -1 },
          });
          console.log(
            `Allocated ${student.name} to room ${room.room_name}`
          );
        } catch (e) {}