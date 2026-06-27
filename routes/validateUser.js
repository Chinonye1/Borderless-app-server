const User = require("../models/User.model");

async function validateUser(req, res) {
  const { email, password } = req.body;

  //validations
  if (!email || !password) {
    res.status(400).json({ errorMessage: "Email and Password are required!" });
    return;
  }

  const passwordRegrex =
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
  if (passwordRegrex.test(password) === false) {
    res.status(400).json({
      errorMessage:
        "Opps...Password is not strong enough, needs to contain one digit, one uppercase, one lowercase and at least 8 character length.",
    });
    return;
  }

  //check for email existence
  const foundUser = await User.findOne({ email: email });
  if (foundUser) {
    res.status(400).json({
      errorMessage: "Opps...User already registered with that email.",
    });
    return;
  }
}

module.exports = validateUser;
