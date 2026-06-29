const router = require("express").Router();
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

const User = require("../models/User.model");
const Physician = require("../models/Physician.model");
const upload = require("../config/cloudinary");
const verifyToken = require("../middleware/auth.middleware");

// ==================CREATE PHYSICIAN==============
router.post(
  "/users/physician",
  verifyToken,
  upload.single("image"),
  async (req, res) => {
    // Start a session so the User and Physician are created atomically.
    // If either insert fails, the whole transaction is rolled back and no orphaned user is left behind.
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const newUser = {
        email: req.body.email,
        password: req.body.password,
        fullname: req.body.fullname,
        country: req.body.country,
        languages: req.body.languages,
        age: req.body.age,
        role: "physician",
      };

      // With a session, `create` takes an array and returns an array.
      const [createdUser] = await User.create([newUser], { session });

      const newPhysician = {
        user: createdUser._id,
        department: req.body.department,
        specialty: req.body.specialty,
        consultfee: req.body.consultfee,
        image: req.file?.path,
      };

      const [createdPhysician] = await Physician.create([newPhysician], {
        session,
      });

      // Both inserts succeeded — make them permanent.
      await session.commitTransaction();

      res.status(200).json({ createdUser, createdPhysician });
    } catch (error) {
      // Something failed — undo the user insert (and anything else).
      await session.abortTransaction();

      // The image was uploaded to Cloudinary before the transaction ran, so if the DB work rolled back, remove the now orphaned file.
      if (req.file) {
        await cloudinary.uploader.destroy(req.file.filename);
      }

      console.log(error);
      res.status(400).json({ error: error.message });
    } finally {
      // Always release the session.
      session.endSession();
    }
  },
);

// ==================GET ALL PHYSICIANS==============
router.get("/users/physicians", verifyToken, async (req, res) => {
  try {
    const allPhysicians = await Physician.find();
    res.status(200).json(allPhysicians);
  } catch (error) {
    console.log(error);
  }
});

// ==================GET A SINGLE PHYSICIAN==============
router.get("/users/physician/:physicianId", verifyToken, async (req, res) => {
  try {
    const physicianId = req.params.physicianId;
    const response = await Physician.findOne({_id: physicianId}  );
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
  }
});

// ==================UPDATE PHYSICIAN BY ID==============
router.patch("/users/physician/:physicianId", verifyToken, async (req, res) => {
  try {
    const physicianId = req.params.physicianId;
    const response = await Physician.findByIdAndUpdate(physicianId, req.body, {
      new: true,
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
  }
});

// ==================DELETE PHYSICIAN BY ID==============
router.delete("/users/physician/:physicianId", verifyToken, async (req, res) => {
  try {
    const physicianId = req.params.physicianId;
    const response = await Physician.findByIdAndDelete(physicianId);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
