const router = require("express").Router();
const Connection = require("../models/Connection.model");
const Patient = require("../models/Patient.model");
const Physician = require("../models/Physician.model");
const verifyToken = require("../middleware/auth.middleware");

router.post("/connections", verifyToken, async (req, res, next) => {
  try {
    const role = req.user.role;

    let patient;
    let physician;
    let initiatedBy;
    if (role === "patient") {
      initiatedBy = "patient";

      patient = await Patient.findOne({ user: req.user._id });

      physician = await Physician.findById(req.body.physicianId);
    } else if (role === "physician") {
      initiatedBy = "physician";
      physician = await Physician.findOne({ user: req.user._id });
  
      patient = await Patient.findById(req.body.patientId);
    }

    //check for profile existence
    if (!patient || !physician) {
      return res
        .status(404)
        .json({ errorMessage: "Patient or physician not found" });
    }
    //check if the connection already exist to avoid duplicate
    const existing = await Connection.findOne({
      patient: patient._id,
      physician: physician._id,
      status: { $in: ["pending", "accepted"] },
    });
    if (existing) {
      return res
        .status(400)
        .json({
          errorMessage:
            "You already have an active connection with this person.",
        });
    }

    const connection = await Connection.create({
      patient: patient._id,
      physician: physician._id,
      initiatedBy,
      message: req.body.message,
    });
    res.status(201).json(connection);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
