const { Client } = require("../models/client.scheme");
const { Location } = require("../models/location.scheme");
const { User } = require("../models/user.scheme");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');

const newClient = {
  // AUTH ENDPOINTS
  // client sign up
  signUp: async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const client = await new Client({ password: hashedPassword, email });
    client.save().then((clientInfo) => {
      jwt.sign(
        { id: clientInfo._id, email: clientInfo.email },
        process.env.JWTPRIVATEKEY,
        (err, token) => {
          if (err) {
            console.log(err);
            res.sendStatus(500);
          } else {
            res.cookie("token", token, { httpOnly: false });
            res.json({ id: clientInfo._id, email: clientInfo.email });
          }
        }
      );
    });
  },

  login: async (req, res) => {
    const { email, password } = req.body;
    try {
      const clientInfo = await Client.findOne({ email });
      if (!clientInfo) {
        return res.sendStatus(401);
      }
      const passOk = bcrypt.compareSync(password, clientInfo.password);
      if (passOk) {
        const token = jwt.sign({ id: clientInfo._id, email }, process.env.JWTPRIVATEKEY);
        // res.cookie("token", token, { httpOnly: false });
        res.json({ auth: true, token: token, data: clientInfo });
      } else {
        res.sendStatus(401);
      }
    } catch (err) {
      res.status(500).send(err.message);
    }
  },

  // OTHER ENDPOINTS
  addUser: async (req, res) => {
    try {
      const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

      const payload = jwt.verify(token, process.env.JWTPRIVATEKEY);

      console.log(payload)

      // Check if user with the same email already exists
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        // res.json({message:'User with the same email already exists' });
        throw new Error('User with the same email already exists');
      }

      const hashedPassword = bcrypt.hashSync(req.body.password, 10);

      const user = new User({
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        role: "user",
        phone: req.body.phone,
        password: hashedPassword,
        companyId: payload.id,
      });

      await user.save();
      // res.sendStatus(201);
      res.json({message:'User Added Successfully' })
    } catch (err) {
      res.status(400).send(err.message);
    }
  },


  addLocation: async (req, res) => {
    try {
      const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

      // const payload = jwt.verify(token[1], process.env.JWTPRIVATEKEY);
      const payload = jwt.verify(token, process.env.JWTPRIVATEKEY);

      const location = await new Location({
        companyName: req.body.companyName,
        clockInTime: req.body.clockInTime,
        organizationLocation: req.body.organizationLocation,
        companyId: new mongoose.Types.ObjectId(payload.id),
      });

      location.save().then((location) => {
        res.json(location);
      });
    } catch (err) {
      res.send(err.message);
    }
  },


  addLocationMod: async (req, res) => {
    try {
      const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
      const payload = jwt.verify(token, process.env.JWTPRIVATEKEY);

      console.log(token)
      console.log('-----------------------')
      console.log(payload)

      // Check if a location record with the same companyId already exists
      const existingLocation = await Location.findOne({ companyId: payload.id });

      if (existingLocation) {
        // If a record exists, update it with new data
        existingLocation.clockInTime = req.body.clockInTime;
        existingLocation.organizationLocation = req.body.organizationLocation;
        existingLocation.radius = req.body.radius;

        await existingLocation.save();
        res.json(existingLocation);
      } else {
        // If no record exists, create a new one
        const location = new Location({
          clockInTime: req.body.clockInTime,
          organizationLocation: req.body.organizationLocation,
          radius: req.body.radius,
          companyId: new mongoose.Types.ObjectId(payload.id),
        });

        await location.save();
        res.json(location);
      }
    } catch (err) {
      res.status(400).send(err.message);
    }
  },


  viewUsers: async (req, res) => {
    try {
      // Extract token and decode
      const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

      const payload = jwt.verify(token, process.env.JWTPRIVATEKEY);

      // Find all users that belong to the same company
      const users = await User.find({ companyId: payload.id });

      res.json(users);
    } catch (err) {
      res.status(500).send(err.message);
    }
  }


};

module.exports = newClient;
