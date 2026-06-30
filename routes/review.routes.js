const router = require("express").Router();

const Review = require("../models/Review.model");
const Patient = require("../models/Patient.model");
const verifyToken = require("../middleware/auth.middleware");

// ==================CREATE A REVIEW (patients only)==============
router.post("/reviews", verifyToken, async (req, res, next) => {
  try {
    if (req.user.role !== "patient") {
      return res
        .status(403)
        .json({ errorMessage: "Only patients can leave reviews." });
    }

    // Resolve the patient profile of the logged-in user.
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({ errorMessage: "Patient profile not found." });
    }

    const { department, rating, comment } = req.body;
    if (!department || !rating) {
      return res
        .status(400)
        .json({ errorMessage: "Department and rating are required." });
    }

    const review = await Review.create({
      patient: patient._id,
      department,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
});

// ==================GET REVIEWS==============
// Public. Optional ?department=<id> filter. Newest first.
router.get("/reviews", async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.department) filter.department = req.query.department;

    const reviews = await Review.find(filter)
      .populate({
        path: "patient",
        populate: { path: "user", select: "fullname country" },
      })
      .populate("department", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
