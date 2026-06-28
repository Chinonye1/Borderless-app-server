const router = require("express").Router();

// ℹ️ Organize and connect all your route files here.
const authRouter = require("./auth.routes");
const patientRouter = require("./patient.routes");
const physicianRouter = require("./physician.routes");
const departmentRouter = require("./department.routes");
const connectionRouter = require("./connection.routes")

router.use("/auth", authRouter);
router.use("/", patientRouter);
router.use("/", physicianRouter);
router.use("/", departmentRouter);
router.use("/", connectionRouter)

module.exports = router;
