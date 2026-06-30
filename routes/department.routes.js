const router = require("express").Router();

const Department = require("../models/Department.model");
const verifyToken = require("../middleware/auth.middleware");
const upload = require("../config/cloudinary");

// specialties may arrive as an array (multiple form fields) or a
// comma-separated string. Normalize both into a clean array of strings.
function parseSpecialties(value) {
  if (Array.isArray(value)) return value.map((s) => s.trim()).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return undefined;
}

// ==================CREATE DEPARTMENT==============
router.post(
  "/department",
  verifyToken,
  upload.single("image"),
  async (req, res, next) => {
    try {
      const newDepartment = {
        name: req.body.name,
        description: req.body.description,
        code: req.body.code,
        head: req.body.head,
        location: req.body.location,
        isActive: req.body.isActive,
        image: req.file?.path,
        specialties: parseSpecialties(req.body.specialties),
        icon: req.body.icon,
        color: req.body.color,
      };
      const createdDepartment = await Department.create(newDepartment);
      res.status(201).json(createdDepartment);
    } catch (error) {
      next(error);
    }
  },
);

// ==================UPDATE DEPARTMENT BY ID==============
router.patch(
  "/department/:departmentId",
  verifyToken,
  upload.single("image"),
  async (req, res, next) => {
    try {
      // Build the update from only the fields that were actually sent.
      const updates = {};
      const fields = ["name", "description", "code", "head", "location", "isActive", "icon", "color"];
      fields.forEach((field) => {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
      });

      const specialties = parseSpecialties(req.body.specialties);
      if (specialties !== undefined) updates.specialties = specialties;

      if (req.file) updates.image = req.file.path;

      const updated = await Department.findByIdAndUpdate(
        req.params.departmentId,
        updates,
        { new: true },
      );
      if (!updated) {
        return res.status(404).json({ errorMessage: "Department not found" });
      }
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  },
);

// ==================GET DEPARTMENT BY ID==============
router.get("/department/:departmentId", verifyToken, async (req, res, next) => {
  try {
    const departmentId = req.params.departmentId;
    const response = await Department.findById(departmentId).populate("head");
    if (!response) {
      return res.status(404).json({ errorMessage: "Department not found" });
    }
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// ==================GET ALL DEPARTMENTS==============
router.get("/departments", async (req, res, next) => {
  try {
    const departments = await Department.find();
    res.status(200).json(departments);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
