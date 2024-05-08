const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Location } = require("../models/location.scheme");
const { User } = require("../models/user.scheme");
const { Clockindata } = require("../models/clockin.scheme");

// geometry function to determine if user's location
// is within the specified range(radius) of the (organization) location
function isWithinRadius(userLocation, companyLocation, radius) {
  function toRad(x) {
    return (x * Math.PI) / 180;
  }

  var lon1 = userLocation[0];
  var lat1 = userLocation[1];

  var lon2 = companyLocation[0];
  var lat2 = companyLocation[1];

  var R = 6371; // Radius of the earth in km

  var x1 = lat2 - lat1;
  var dLat = toRad(x1);
  var x2 = lon2 - lon1;
  var dLon = toRad(x2);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var distanceInKm = R * c;

  // convert radius to kilometers if it's not
  var radiusInKm = radius / 1000;

  return distanceInKm <= radiusInKm;
}

const userController = {
  login: async (req, res) => {
    const { email, password } = req.body;
    try {
      const userInfo = await User.findOne({ email });
      console.log(email)

      if (!userInfo) {
        return res.status(401).send('No user found with this email');
      }



      const passOk = bcrypt.compareSync(password, userInfo.password);
      if (passOk) {
        const token = jwt.sign({ id: userInfo._id, email }, process.env.JWTPRIVATEKEY, { expiresIn: '1h' });
        // res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV !== 'development', sameSite: 'lax' });
        res.json({ auth: true, token: token, data: userInfo });
      } if (!passOk) {
        return res.status(401).send('Incorrect password');
      }
    } catch (err) {
      res.status(500).send(err.message);
    }
  },

  clockIn: async (req, res) => {
    try {
      const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
      const payload = jwt.verify(token, process.env.JWTPRIVATEKEY);
      const companyId = payload.id;

      let userCurrentPosition = req.body.userPosition;
      let userEmail = req.body.email;

      // Fetch the current user
      let currentUser = await Clockindata.findOne({ email: userEmail });
      // console.log(currentUser)

      // Handle case where user does not exist in the database
      if (!currentUser) {
        currentUser = new Clockindata({ email: userEmail, companyId });
        await currentUser.save();
      }

      let currentDate = new Date();

      // Check if there's an entry for today in userStatus
      const todaysStatus = currentUser.userStatus.find(status => {
        const statusDate = new Date(status.date);
        return statusDate.getDate() == currentDate.getDate() &&
          statusDate.getMonth() == currentDate.getMonth() &&
          statusDate.getFullYear() == currentDate.getFullYear();
      });

      if (todaysStatus && todaysStatus.clockedIn) {
        return res.status(200).json({ message: "User has already clocked in today" });
      }

      const locationId = await Location.where({ locationId: new mongoose.Types.ObjectId(companyId) }).find();
      let location = locationId[0].organizationLocation;
      let radius = locationId[0].radius;
      let orgClockInTimeString = locationId[0].clockInTime;

      let isWithin = isWithinRadius(userCurrentPosition, location, radius);
      if (!isWithin) {
        return res.status(200).json({ message: "User is not within range" });
      }

      let [orgHours, orgMinutes] = orgClockInTimeString.split(":").map(Number);
      let orgClockInTime = new Date();
      orgClockInTime.setHours(orgHours, orgMinutes, 0, 0);
      let isOnTime = currentDate <= orgClockInTime;
      let message = isOnTime ? "User clocked in successfully on time" : "User clocked in late";

      let timestampUpdate = {
        clockInTime: currentDate
      };

      if (todaysStatus) {
        todaysStatus.timestamps.push(timestampUpdate);
        todaysStatus.clockedIn = true;
        await currentUser.save();
      } else {
        let statusUpdate = {
          date: currentDate,
          clockedIn: true,
          timestamps: [timestampUpdate]
        };
        currentUser.userStatus.push(statusUpdate);
        await currentUser.save();
      }

      return res.json({ message: message });

    } catch (err) {
      console.error(err);
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).send('Invalid Token');
      } else {
        return res.status(500).send(err.message);
      }
    }
  },



  getCurrentUser: async (req, res) => {
    try {
      const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
      const payload = jwt.verify(token, process.env.JWTPRIVATEKEY);


      const user = await User.findById(payload.id);
      console.log(payload.id)

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (err) {
      res.status(500).send(err.message);
    }
  },

  // FETCH ORGNANIZATION CLOCK INFO
  getOrganizationClock: async (req, res) => {
    try {
      const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
      const payload = jwt.verify(token, process.env.JWTPRIVATEKEY);
      const companyId = payload.id;

      const locationId = await Location.where({ locationId: new mongoose.Types.ObjectId(companyId) }).find();

      // add your success response here
      res.send({ clockInTime: locationId[0].clockInTime })

    } catch (err) {
      res.status(500).send(err.message);
    }
  },


  // RESET PASSWORD
  resetPassword: async (req, res) => {
    this.getCurrentUser()

  },

  analytics: async (req, res) => {
    // Code here
  },

  requestBreak: async (req, res) => {
    // Code here
  },

  clockOut: async (req, res) => {
    try {
      const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
      const payload = jwt.verify(token, process.env.JWTPRIVATEKEY);
      let userEmail = req.body.email;

      // Fetch the current user
      let currentUser = await Clockindata.findOne({ email: userEmail });

      if (!currentUser) {
        return res.status(400).json({ message: "User not found." });
      }

      let currentDate = new Date();

      // Check if there's an entry for today in userStatus
      const todaysStatus = currentUser.userStatus.find(status => {
        const statusDate = new Date(status.date);
        return statusDate.getDate() == currentDate.getDate() &&
          statusDate.getMonth() == currentDate.getMonth() &&
          statusDate.getFullYear() == currentDate.getFullYear();
      });

      if (!todaysStatus) {
        return res.status(200).json({ message: "No clock-in entry for today. Cannot clock out." });
      }

      if (todaysStatus.clockedOut) {
        return res.status(200).json({ message: "User has already clocked out today." });
      }

      todaysStatus.clockedOut = true;
      await currentUser.save();
      return res.json({ message: "User clocked out successfully." });

    } catch (err) {
      console.error(err);
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).send('Invalid Token');
      } else {
        return res.status(500).send(err.message);
      }
    }
  },


  logOut: async (req, res) => {
    try {
      res.clearCookie('token');
      return res.json({ message: "Logged out successfully." });
    } catch (err) {
      console.error(err);
      return res.status(500).send(err.message);
    }
  }

};

module.exports = userController;
