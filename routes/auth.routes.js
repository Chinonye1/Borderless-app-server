const User = require("../models/User.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Patient = require("../models/Patient.model");
const Physician = require("../models/Physician.model");
const verifyToken = require("../middleware/auth.middleware");

const router = require("express").Router();

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
 
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ errorMessage: "Email and Password are required!" });
    }

    const foundUser = await User.findOne({ email: email });
    if (!foundUser) {
      return res.status(401).json({
        errorMessage:
          "Opps..User not found with this email. Please sign up first!.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ errorMessage: "Opps...Password is not correct." });
    }

    //TOKEN
    const payload = {
      user: {
        _id: foundUser._id,
        email: foundUser.email,
        role: foundUser.role,
      },
    };

    const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({ authToken: authToken });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me....helps to return the loggedin user and their profile
router.get("/me", verifyToken, async (req, res, next) => {
  try {
  
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ errorMessage: "User not found" });
    }


    let profile = null;
    if (user.role === "patient") {
      profile = await Patient.findOne({ user: user._id });
    } else if (user.role === "physician") {
      profile = await Physician.findOne({ user: user._id }).populate("department");
    }

    
    res.status(200).json({ user, profile });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
