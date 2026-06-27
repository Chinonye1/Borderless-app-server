const User = require("../models/User.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
      return res
        .status(401)
        .json({
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

module.exports = router;
