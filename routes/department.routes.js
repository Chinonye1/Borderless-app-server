const router = require("express").Router();

const Department = require("../models/Department.model");
const verifyToken = require("../middleware/auth.middleware");

// ==================CREATE DEPARTMENT==============
router.post("/department", verifyToken, async (req, res) => {
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
    console.log(error);
  }
});

// ==================GET DEPARTMENT BY ID==============
router.get("/department/:departmentId", verifyToken, async (req, res) => {
  try {
    const departmentId = req.params.departmentId;
    const response = await Department.findById( departmentId );
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
