exports.dynamicToken = async (req, res) => {
  const token = req.cookies.tokenABC;
  const notificationCount = await Request.countDocuments({ clicked: false });
  const userdata = req.cookies.userData;
  const username = JSON.parse(userdata);

  res.render("/required/header", {
    token: token,
    notificationCount: notificationCount,
    username: username,
  });
};
