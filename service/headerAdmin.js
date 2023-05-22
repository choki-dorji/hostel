exports.dynamicToken = async (req, res) => {
  const token = req.cookies.tokenABC;
  const notificationCount = await Request.countDocuments({ clicked: false });
  const user = req.cookies.userData;
  const userdata = JSON.parse(user);

  console.log(typeof userdata)

  res.render("/required/header", {
    token: token,
    notificationCount: notificationCount,
    username: userdata.name,
  });
};
