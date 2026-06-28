const router = require("express").Router();
const Connection = require("../models/Connection.model")
const Patient = require("../models/Patient.model")
const Physician = require("../models/Physician.model")
const verifyToken = require("../middleware/auth.middleware");


module.exports = router;