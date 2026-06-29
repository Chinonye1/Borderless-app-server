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
        .status(400)
        .json({ errorMessage: "Patient or physician not found" });
    }
    //check if the connection already exist to avoid duplicate
    const existing = await Connection.findOne({
      patient: patient._id,
      physician: physician._id,
      status: { $in: ["pending", "accepted"] },
    });
    if (existing) {
      return res.status(400).json({
        errorMessage: "You already have an active connection with this person.",
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

router.get("/connections", verifyToken, async (req, res, next) => {
  try {
    const role = req.user?.role;

    let myProfile;
    let myField;

    // Find my profile and my field
    if (role === "patient") {
      myProfile = await Patient.findOne({ user: req.user._id });
      myField = "patient";
    } else if (role === "physician") {
      myProfile = await Physician.findOne({ user: req.user._id });
      myField = "physician";
    }
    if (!myProfile) {
      return res.status(404).json({ errorMessage: "Profile not found" });
    }

    const filter = { [myField]: myProfile._id };
    // Optional status filter
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const connections = await Connection.find(filter)
      .populate({
        path: "patient",
        populate: { path: "user", select: "fullname email country" },
      })
      .populate({
        path: "physician",
        populate: { path: "user", select: "fullname email" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(connections);
  } catch (error) {
    next(error);
  }
});

router.patch("/connections/:id", verifyToken, async (req, res, next) => {
  try {

     

    const { status } = req.body;

    // Only "accepted" or "declined" are valid responses
    if (!["accepted", "declined"].includes(status)) {
      return res.status(400).json({ errorMessage: "Status must be 'accepted' or 'declined'." });
    }

    //  Find the connection
    const connection = await Connection.findById(req.params.id);
    if (!connection) {
      return res.status(404).json({ errorMessage: "Connection not found" });
    }

    // A person Can only respond to a still pending request
    if (connection.status !== "pending") {
      return res.status(400).json({ errorMessage: "This request has already been resolved." });
    }

    // Only the recipient may respond
    const recipientRole = connection.initiatedBy === "patient" ? "physician" : "patient";

    if (req.user.role !== recipientRole) {
      return res.status(403).json({ errorMessage: "You are not allowed to respond to this request." });
    }

    let myProfile;
    if (recipientRole === "physician") {
      myProfile = await Physician.findOne({ user: req.user._id });
    } else {
      myProfile = await Patient.findOne({ user: req.user._id });
    }
    if (!myProfile || !connection[recipientRole].equals(myProfile._id)) {
      return res.status(403).json({ errorMessage: "You are not allowed to respond to this request." });
    }

    //Update and save
    connection.status = status;
    await connection.save();

    res.status(200).json(connection);
  } catch (error) {
    next(error);
  }
});





module.exports = router;
