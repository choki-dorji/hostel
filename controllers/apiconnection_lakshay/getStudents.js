const HttpError = require("../../models/httperror");
const axios = require("axios");
const STUDENTS = [
  {
    id: "b643cbdc-7f74-4ea6-857b-dac9386cb015",
    name: "Sonam Wangdi",
    password: "$2a$08$TB6JczH1ecjr6ypR0cJNvesroEv5uhccetJvKzhpT.j3RD9cCpBI6",
    role: "user",
    program: "School of Computing",
    specialization: "Blockchain",
    status: "Reported",
    stdtype: "Government Scholarship",
    meal_category: "Mess",
    sid: 12200023,
    cid: "10705028037",
    gender: "M",
    email: "12200023.gcit@rub.edu.bt",
    bank: "BOB",
    account_no: 201951234,
    name_of_account_holder: "Sonam Wangdi",
    photo: "1GVsJchqCzQ2rE_zRf6WcdLz8irXyR9_5",
    disability: true,
    medical_report: "1N6tdJdbBGgat0BYLr20PpIBAAGbq6Ric",
    year: "3",
  },
  {
    id: "107bd4c5-7415-4987-8b9d-e0247d745ab3",
    name: "Tshering Wangchuk",
    password: "$2a$08$IJs9sM5ea0XUM7DUDthjw.Yl0XqKWnooeD1xaOuowN7..hJKrwVdG",
    role: "user",
    program: "School of Computing",
    specialization: "FullStack",
    status: "Reported",
    stdtype: "Government Scholarship",
    meal_category: "Mess",
    sid: 12220001,
    cid: "11100295432",
    gender: "M",
    email: "12220001.gcit@rub.edu.bt",
    bank: "BOB",
    account_no: 201212097,
    name_of_account_holder: "Tshering Wangchuk",
    photo: "1KifybWk3-v7-n8TfNzMtPKffscGCbf44",
    disability: false,
    medical_report: null,
    year: "1",
  },
  {
    id: "3d078e24-f324-48ad-b375-bc6b36ea2036",
    name: "Tashi Deki",
    password: "$2a$08$79tBRCedD6uddX5Y6EnK7OW1prWUgxsj9n0dvMHcULgD5CkP0zNUS",
    role: "user",
    program: "School of Computing",
    specialization: "Blockchain",
    status: "Reported",
    stdtype: "Government Scholarship",
    meal_category: "Mess",
    sid: 12200035,
    cid: "10705983652",
    gender: "F",
    email: "12200035.gcit@rub.edu.bt",
    bank: "BOB",
    account_no: 201998635,
    name_of_account_holder: "Tashi Deki",
    photo: "1sCguRLtWsWW2Qpast40Bp2Bjd5niiFCk",
    disability: false,
    medical_report: null,
    year: "3",
  },
  {
    id: "411b1c55-cd63-4948-8c97-e6fea12b5fea",
    name: "Pema Dawa",
    password: "$2a$08$cPL8fHV/VZglQNNDfcqiZelDtYd52ItfCJZDr7XzdaBlPnsjGqXqi",
    role: "user",
    program: "School of Computing",
    specialization: "Blockchain",
    status: "Reported",
    stdtype: "Government Scholarship",
    meal_category: "Mess",
    sid: 12210013,
    cid: "11100298375",
    gender: "M",
    email: "12210013.gcit@rub.edu.bt",
    bank: "BOB",
    account_no: 201238635,
    name_of_account_holder: "Pema Dawa",
    photo: "1GwhwFGggUT4SITQKHR1WyDiLCNbOPlEX",
    disability: false,
    medical_report: null,
    year: "2",
  },
  {
    id: "5ff26eef-fa8f-439f-88e2-dc56c7bd6a99",
    name: "Tashi Lhamo",
    password: "$2a$08$Ar7CiEo1yW5nxtZOjUDLB.dOVPcnRi9Ly2S/60S451d2BZbL5HjuS",
    role: "user",
    program: "School of Computing",
    specialization: "FullStack",
    status: "Reported",
    stdtype: "Government Scholarship",
    meal_category: "Mess",
    sid: 12190028,
    cid: "10705003005",
    gender: "F",
    email: "12190028.gcit@rub.edu.bt",
    bank: "BOB",
    account_no: 201958823,
    name_of_account_holder: "Tashi Lhamo",
    photo: "1vJJc1gTPq4ItpysXFIGbI4p0MfqUJRCI",
    disability: false,
    medical_report: null,
    year: "4",
  },
  {
    id: "7ccbe706-62d0-4512-83c4-924e47b88165",
    name: "Sangay Lakshay Yangzom",
    password: "$2a$08$gtenrazkW2SCiKPdwPPSyubt3Tj91phK0MtgtrVxGpoMtGbHuJFDO",
    role: "user",
    program: "School of Computing",
    specialization: "FullStack",
    status: "Reported",
    stdtype: "Government Scholarship",
    meal_category: "Mess",
    sid: 12190022,
    cid: "10705001001",
    gender: "F",
    email: "12190022.gcit@rub.edu.bt",
    bank: "BOB",
    account_no: 201958823,
    name_of_account_holder: "Sangay Lakshay",
    photo: "18ZDIccPskSCrmus3DMvjCHq5TDranG4y",
    disability: false,
    medical_report: null,
    year: "4",
  },
  {
    id: "82551714-d5fa-45cd-aa54-abc220e27a34",
    name: "Tshering Dema",
    password: "$2a$08$xuA3FCFpjrzUIVZRzXYMF.XsbY3cJBT4c5VQ/QzcapTzpgG5bN5ZS",
    role: "user",
    program: "School of Computing",
    specialization: "FullStack",
    status: "Reported",
    stdtype: "Government Scholarship",
    meal_category: "Mess",
    sid: 12210040,
    cid: "11100291234",
    gender: "F",
    email: "12210040.gcit@rub.edu.bt",
    bank: "BOB",
    account_no: 201238123,
    name_of_account_holder: "Tshering Dema",
    photo: "1BiAoBrHpZksCz6wNiwBUQ8FrTRfr5BDG",
    disability: false,
    medical_report: null,
    year: "2",
  },
  {
    id: "e974a38f-de0a-4eda-ae77-92464b6281f4",
    name: "Pema Selden",
    password: "$2a$08$L.aAkT/uz.5f3lhY67SSrus34IyJr7c5PZd8B4B7T8KFJkwEmyFQi",
    role: "user",
    program: "School of Computing",
    specialization: "Blockchain",
    status: "Reported",
    stdtype: "Government Scholarship",
    meal_category: "Mess",
    sid: 12220007,
    cid: "12031954321",
    gender: "F",
    email: "12220007.gcit@rub.edu.bt",
    bank: "BOB",
    account_no: 200287352,
    name_of_account_holder: "Pema Selden",
    photo: "1YTObBilbd42RNI5jmtl_8gz_QXkNW82M",
    disability: false,
    medical_report: null,
    year: "1",
  },
  {
    id: "b643cbdc-7f74-4ea6-857b-dac9386cb016",
    name: "Kinley Gyeltshen",
    password: "$2a$08$TB6JczH1ecjr6ypR0cJNvesroEv5uhccetJvKzhpT.j3RD9cCpBI6",
    role: "user",
    program: "School of Computing",
    specialization: "Blockchain",
    status: "Reported",
    stdtype: "Government Scholarship",
    meal_category: "Mess",
    sid: 12190060,
    cid: "10705028031",
    gender: "M",
    email: "12190060.gcit@rub.edu.bt",
    bank: "BOB",
    account_no: 201951235,
    name_of_account_holder: "Sonam Wangdi",
    photo: "1GVsJchqCzQ2rE_zRf6WcdLz8irXyR9_5",
    disability: true,
    medical_report: "1N6tdJdbBGgat0BYLr20PpIBAAGbq6Ric",
    year: "3",
  },
  {
    id: "b643cbdc-7f74-4ea6-857b-dac9386cb017",
    name: "Tshering Duba",
    password: "$2a$08$IJs9sM5ea0XUM7DUDthjw.Yl0XqKWnooeD1xaOuowN7..hJKrwVdG",
    role: "user",
    program: "School of Computing",
    specialization: "FullStack",
    status: "Reported",
    stdtype: "Government Scholarship",
    meal_category: "Mess",
    sid: 12190094,
    cid: "11100295423",
    gender: "M",
    email: "12190094.gcit@rub.edu.bt",
    bank: "BOB",
    account_no: 201212096,
    name_of_account_holder: "Tshering Wangchuk",
    photo: "1KifybWk3-v7-n8TfNzMtPKffscGCbf44",
    disability: false,
    medical_report: null,
    year: "1",
  },
  {
    id: "b643cbdc-7f74-4ea6-857b-dac9386cb018",
    name: "Sonam Cheda",
    password: "$2a$08$79tBRCedD6uddX5Y6EnK7OW1prWUgxsj9n0dvMHcULgD5CkP0zNUS",
    role: "user",
    program: "School of Computing",
    specialization: "Blockchain",
    status: "Reported",
    stdtype: "Government Scholarship",
    meal_category: "Mess",
    sid: 12190076,
    cid: "10705983643",
    gender: "M",
    email: "12190076.gcit@rub.edu.bt",
    bank: "BOB",
    account_no: 201998635,
    name_of_account_holder: "Tashi Deki",
    photo: "1sCguRLtWsWW2Qpast40Bp2Bjd5niiFCk",
    disability: false,
    medical_report: null,
    year: "3",
  },
  {
    id: "b643cbdc-7f74-4ea6-857b-dac9386cb019",
    name: "Phuntsho Dorji",
    password: "$2a$08$cPL8fHV/VZglQNNDfcqiZelDtYd52ItfCJZDr7XzdaBlPnsjGqXqi",
    role: "user",
    program: "School of Computing",
    specialization: "Blockchain",
    status: "Reported",
    stdtype: "Government Scholarship",
    meal_category: "Mess",
    sid: 12190070,
    cid: "11100298323",
    gender: "M",
    email: "12190070.gcit@rub.edu.bt",
    bank: "BOB",
    account_no: 201238633,
    name_of_account_holder: "Pema Dawa",
    photo: "1GwhwFGggUT4SITQKHR1WyDiLCNbOPlEX",
    disability: false,
    medical_report: null,
    year: "2",
  },
  {
    id: "b643cbdc-7f74-4ea6-857b-dac9386cb020",
    name: "Rashmi Gurung",
    password: "$2a$08$Ar7CiEo1yW5nxtZOjUDLB.dOVPcnRi9Ly2S/60S451d2BZbL5HjuS",
    role: "user",
    program: "School of Computing",
    specialization: "FullStack",
    status: "Reported",
    stdtype: "Government Scholarship",
    meal_category: "Mess",
    sid: 12190072,
    cid: "10705003009",
    gender: "F",
    email: "12190072.gcit@rub.edu.bt",
    bank: "BOB",
    account_no: 201958825,
    name_of_account_holder: "Tashi Lhamo",
    photo: "1vJJc1gTPq4ItpysXFIGbI4p0MfqUJRCI",
    disability: false,
    medical_report: null,
    year: "4",
  },
  {
    id: "b643cbdc-7f74-4ea6-857b-dac9386cb021",
    name: "Sangay Lakshay Yangzom",
    password: "$2a$08$gtenrazkW2SCiKPdwPPSyubt3Tj91phK0MtgtrVxGpoMtGbHuJFDO",
    role: "user",
    program: "School of Computing",
    specialization: "FullStack",
    status: "Reported",
    stdtype: "Government Scholarship",
    meal_category: "Mess",
    sid: 12190020,
    cid: "10705001023",
    gender: "F",
    email: "12190020.gcit@rub.edu.bt",
    bank: "BOB",
    account_no: 201958821,
    name_of_account_holder: "Sangay Lakshay",
    photo: "18ZDIccPskSCrmus3DMvjCHq5TDranG4y",
    disability: false,
    medical_report: null,
    year: "4",
  },
  {
    id: "b643cbdc-7f74-4ea6-857b-dac9386cb022",
    name: "Gyeltshen Wangdi",
    password: "$2a$08$xuA3FCFpjrzUIVZRzXYMF.XsbY3cJBT4c5VQ/QzcapTzpgG5bN5ZS",
    role: "user",
    program: "School of Computing",
    specialization: "FullStack",
    status: "Reported",
    stdtype: "Government Scholarship",
    meal_category: "Mess",
    sid: 12190053,
    cid: "11100291224",
    gender: "F",
    email: "12190053.gcit@rub.edu.bt",
    bank: "BOB",
    account_no: 201238120,
    name_of_account_holder: "Tshering Dema",
    photo: "1BiAoBrHpZksCz6wNiwBUQ8FrTRfr5BDG",
    disability: false,
    medical_report: null,
    year: "2",
  },
  {
    id: "b643cbdc-7f74-4ea6-857b-dac9386cb023",
    name: "Pema Selden",
    password: "$2a$08$L.aAkT/uz.5f3lhY67SSrus34IyJr7c5PZd8B4B7T8KFJkwEmyFQi",
    role: "user",
    program: "School of Computing",
    specialization: "Blockchain",
    status: "Reported",
    stdtype: "Government Scholarship",
    meal_category: "Mess",
    sid: 12220003,
    cid: "12031954323",
    gender: "F",
    email: "12220003.gcit@rub.edu.bt",
    bank: "BOB",
    account_no: 200287351,
    name_of_account_holder: "Pema Selden",
    photo: "1YTObBilbd42RNI5jmtl_8gz_QXkNW82M",
    disability: false,
    medical_report: null,
    year: "1",
  },
];

// exports.GetStudents = async (req, res, years) => {
//   const token = req.cookies.tokenABC;
//   console.log("token ", token);

//   try {
//     const response = await axios.get(
//       "https://gcit-user-management.onrender.com/api/v1/UM/join",
//       {
//         headers: {
//           Authorization: "Bearer " + token,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     let students = response.data.filter(
//       (student) => student.year === String(years) && student.isDisabled !== true
//     );
//     students = students.sort(() => Math.random() - 0.5);
//     console.log(students);
//     return students;
//   } catch (e) {
//     console.log(e);
//     console.log("server down");
//   }
// };

exports.GetStudents = (years) => {
  let students = STUDENTS.filter(
    (student) => student.year === String(years) && student.disability !== true
  );
  students = students.sort(() => Math.random() - 0.5);
  return students;
};

exports.countStudentsByYear = (years) => {
  let maleCount = 0;
  let femaleCount = 0;

  const students = STUDENTS;

  // Iterate over each student
  students.forEach((student) => {
    // Check if the student's year matches the specified year
    if (student.year === years) {
      // Increment the corresponding count based on the student's gender
      if (student.gender === "M") {
        maleCount++;
      } else if (student.gender === "F") {
        femaleCount++;
      }
    }
  });

  // Return an object with the male and female counts
  return { male: maleCount, female: femaleCount };
};

exports.GetAllStudents = () => {
  return STUDENTS;
};

exports.TotalAllStudents = (req, res) => {
  res.json(STUDENTS);
};

exports.studentsbyName = (req, res) => {
  const stdname = req.params.id;
  let students = STUDENTS.filter((student) => student.name === stdname);
  res.json(students);
};

// //////////
exports.countStudentsByYearDisable = (years) => {
  let maleCount = 0;
  let femaleCount = 0;

  const students = STUDENTS;

  // Iterate over each student
  students.forEach((student) => {
    // Check if the student's year matches the specified year
    if (student.year === years) {
      // Increment the corresponding count based on the student's gender
      if (student.gender === "M" && !student.disability) {
        maleCount++;
      } else if (student.gender === "F" && !student.disability) {
        femaleCount++;
      }
    }
  });

  // Return an object with the male and female counts
  return { male: maleCount, female: femaleCount };
};
