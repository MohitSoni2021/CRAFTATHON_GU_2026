const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const users = await User.find({}, 'email isVerified type').lean();
    console.log("Users in DB:", users);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
