const RecentActivity = require('../models/models');
const Recent = RecentActivity.RecentActivity;

// GET all recent activities in descending order
exports.getAllRecentActivities = async (req, res) => {
  let recentactivity;
  try{
     recentactivity = await Recent.find().sort({ date: -1 })
   } catch(e){
      const error = new HttpError("Fetching RecentActivity failed", 500);
      return res.status(error.code || 500).json({ message: error.message });
   }
   // if(req.path === "/recent/recent"){
   //   res.render("Dashboard/recentactivity", {recentactivity: recentactivity})    
   // } else {
   //   res.render("Dashboard/index", {recentactivity: recentactivity})    
   // }
   res.send(recentactivity)
   
};