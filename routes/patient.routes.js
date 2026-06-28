const router = require("express").Router();
const cloudinary = require("cloudinary").v2;

const User = require("../models/User.model");
const Patient = require("../models/Patient.model");
const validateUser = require("./validateUser");
const upload = require("../config/cloudinary");
const verifyToken = require("../middleware/auth.middleware");

// ==================CREATE USER + PATIENT (public registration)==============
router.post(
  "/users/patient",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "document", maxCount: 1 },
  ]),
  async (req, res, next) => {
    try {
      // Validate input and check for duplicate email. If it fails, stop here.
      await validateUser(req, res);
      if (res.headersSent) return;

      const newUser = {
        email: req.body.email,
        password: req.body.password, // hashed by the User model's presave hook
        fullname: req.body.fullname,
        country: req.body.country,
        languages: req.body.languages,
        age: req.body.age,
        role: req.body.role,
      };

      const createdUser = await User.create(newUser);

      const newPatient = {
        user: createdUser._id,
        specialistneeded: req.body.specialistneeded,
        description: req.body.description,
        image: req.files?.image?.[0]?.path,
        document: req.files?.document?.[0]?.path,
      };
      const createdPatient = await Patient.create(newPatient);

      res.status(200).json({ createdUser, createdPatient });
    } catch (error) {
      // Files upload before the DB write — if it fails, delete the  uploads.
      if (req.files?.image?.[0]) {
        await cloudinary.uploader.destroy(req.files.image[0].filename);
      }
      if (req.files?.document?.[0]) {
        await cloudinary.uploader.destroy(req.files.document[0].filename);
      }

      console.log(error);
      res.status(500).json({ error: error.message });
    }
  },
);

// ==================GET ALL PATIENTS==============
router.get("/users/patients", verifyToken, async (req, res) => {
  try {
    const allPatients = await Patient.find();
    res.status(200).json(allPatients);
  } catch (error) {
    console.log(error);
  }
});

// ==================GET A SINGLE PATIENT==============
router.get("/users/patient/:patientId", verifyToken, async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const response = await Patient.findOne({ _id: patientId });
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
  }
});

// ==================UPDATE PATIENT BY ID==============
router.put("/users/patient/:patientId", verifyToken, async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const response = await Patient.findByIdAndUpdate({ _id: patientId }, req.body);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
  }
});

// ========= DELETE PATIENT =====================
router.delete("/users/patient/:patientId", verifyToken, async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const response = await Patient.findByIdAndDelete({ _id: patientId });
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
