const router = require("express").Router();

const Department = require("../models/Department.model");
const verifyToken = require("../middleware/auth.middleware");

// ==================CREATE DEPARTMENT==============
router.post("/department", verifyToken, async (req, res, next) => {
  try {
    const newDepartment = {
      name: req.body.name,
      description: req.body.description,
      code: req.body.code,
      head: req.body.head,
      location: req.body.location,
      isActive: req.body.isActive,
    };
    const createdDepartment = await Department.create(newDepartment);
    res.status(200).json(createdDepartment);
  } catch (error) {
    next(error);
  }
});

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
router.get("/departments", verifyToken, async (req, res, next) => {
  try {
    const departments = await Department.find();
    res.status(200).json(departments);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
