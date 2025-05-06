import express from "express";
import User from "../models/User.js";
const router = express.Router();
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fetchUser from "../middleware/fetchUser.js";

const JWT_SECRET = process.env.JWT_SECRET1;
//ROUTE:1:Creare a User using: POST "api/auth/"No login required
router.post(
  "/createuser",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be minimum 3 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    let success = false;
    //If there are errors,return Bad Request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }
    //Check whether the user with this email exists already
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({
          success,
          error: "Sorry a user with this email already exists",
        });
      }
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);
      //Create a new user
      user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
      });
      const data = {
        user: { id: user.id },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);

      // .then(user=>res.json(user)).catch(err=>{console.log(err)
      //     res.json({error: 'Please enter a unique value for email',message:err.message})
      // });
      success = true;
      res.json({ success, authtoken: authtoken });
    } catch (error) {
      //for any error
      console.error(error.message);
      //res.status(500).send("Internal Server Error");
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }
);
//ROUTE:2:Authenticate a User using: POST "api/auth/login"No login required
router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    //If there are errors,return Bad Request and the errors
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        success = false;
        return res
          .status(500)
          .json({ error: "Please try to login with Correct Credentials" });
      }
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        success = false;
        return res.status(500).json({
          success,
          error: "Please try to login with Correct Credentials",
        });
      }
      const data = {
        user: { id: user.id },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);

      success = true;
      res.json({ success, authtoken: authtoken });
    } catch (error) {
      console.error(error.message);
      //res.status(500).send("Internal Server Error");
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }
);
//ROUTE:3:Get loggedin User details using: POST "api/auth/getuser" login required
router.post("/getuser", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
