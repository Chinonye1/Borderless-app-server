// ℹ️ Loads environment variables from a .env file into process.env
try {
  process.loadEnvFile();
} catch (error) {
  console.warn(".env file not found, using default environment values");
}

// Imports Express (a Node.js framework for handling HTTP requests) and initializes the server
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const router = require("./routes/index.routes");
const Patient = require("./models/Patient.model");
const User = require("./models/User.model");
const Physician = require("./models/Physician.model");
const Department = require("./models/Department.model");
const validateUser= require("./routes/validateUser")

// ℹ️ Loads and applies global middleware (CORS, JSON parsing, etc.) for server configurations
const config = require("./config");
config(app);



// ℹ️ Middleware that establishes a database connection. Ensures the connection is created on every request. Required for serverless deployments.
const connectDB = require("./db");
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// CRUD Operations for Physicians
// const Physician = require("./models/Physician.model");
// router.put("/user/");

// // 👇 Defines and applies route handlers

app.use("/api", router);

// ==================CREATED USERS AND PATIENTS==============

router.post("/users/patient", async (req, res, next) => {
  try {
    // It helps to Validate input and check for duplicate email.
    // (e.g. validation failed), stop here.
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
    };
    const createdPatient = await Patient.create(newPatient);

    res.status(200).json({ createdUser, createdPatient });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

// ==================GET  ALL PATIENTS==============

router.get("/users/patients", async (req, res) => {
  try {
    const allPatients = await Patient.find();

    res.status(200).json(allPatients);
  } catch (error) {
    console.log(error);
  }
});

// ==================GET  A SINGLE PATIENT==============

router.get("/users/patient/:patientId", async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const response = await Patient.findOne({ _id: patientId });

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
  }
});

// ==================UPDATE PATIENTS BY ID==============

router.put("/users/patient/:patientId", async (req, res) => {
  try {
    const patientId = req.params.patientId;

    const response = await Patient.findByIdAndUpdate(
      { _id: patientId },
      req.body,
    );

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
  }
});

// ========= DELETE PATIENT =====================

router.delete("/users/patient/:patientId", async (req, res) => {
  try {
    const patientId = req.params.patientId;

    const response = await Patient.findByIdAndDelete({ _id: patientId });

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
  }
});

// ==================CREATE PHYSICIANS==============
router.post("/users/physician", async (req, res) => {

  
  // Start a session so the User and Physician are created atomically.
  // If either insert fails, the whole transaction is rolled back and no
  // orphaned user is left behind.
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

    console.log("new user", createdUser);

    const newPhysician = {
      user: createdUser._id,
      department: req.body.department,
      specialty: req.body.specialty,
      consultfee: req.body.consultfee,
    };

    const [createdPhysician] = await Physician.create([newPhysician], {
      session,
    });

    console.log("new physician", createdPhysician);

    // Both inserts succeeded — make them permanent.
    await session.commitTransaction();

    res.status(200).json({ createdUser, createdPhysician });
  } catch (error) {
    // Something failed — undo the user insert (and anything else).
    await session.abortTransaction();
    console.log(error);
    res.status(400).json({ error: error.message });
  } finally {
    // Always release the session.
    session.endSession();
  }
});

// ==================GET ALL PHYSICIANS==============
router.get("/users/physicians", async (req, res) => {
  try {
    const allPhysicians = await Physician.find();

    res.json(allPhysicians).status(200);
  } catch (error) {
    console.log(error);
  }
});


// ==================GET A SINGLE PHYSICIANS==============
router.get("/users/physician/:physicianId", async (req, res)=>{
  try{
    const physicianId = req.params.physicianId;
    const response = await Physician.findOne({_id: physicianId});

    res.json(response).status(200)

  }catch(error){
    console.log(error)
  }
})


// ==================UPDATE PHYSICIAN BY ID==============

router.patch("/users/physician/:physicianId", async(req, res)=>{
  try{
    const physicianId = req.params.physicianId
    const response = await Physician.findByIdAndUpdate(physicianId, req.body, {new: true})

    res.json(response).status(200)

  }catch(error){
    console.log(error)
  }
})


// ==================DELETE PHYSICIAN BY ID==============
router.delete("/users/physician/:physicianId", async(req, res)=>{
  try{
    const physicianId = req.params.physicianId;
    const response = await Physician.findByIdAndDelete(physicianId)

    res.json(response).status(200)


  }catch(error){
    console.log(error)
  }
})

// ==================CREATE DEPARTMENT==============
router.post("/department", async(req, res)=>{
  try{
    const newDepartment = {
      name: req.body.name,
      description: req.body.description,
      code: req.body.code,
      head: req.body.head,
      location: req.body.location,
      isActive:req.body.isActive

    }
    const createdDepartment = await Department.create(newDepartment)

    res.json(createdDepartment).status(200)

  }catch(error){
    console.log(error)

  }
})

// ==================GET DEPARTMENT BY ID==============
router.get("/department/:departmentId", async (req, res)=>{
  try{
    const departmentId = req.params.departmentId;
    const response = await Department.findById({_id: departmentId})

    res.json(response).status(200)

  }catch(error){
    console.log(error)
  }
})




// ❗ Centralized error handling (must be placed after routes)
const handleErrors = require("./errors");

handleErrors(app);

// ℹ️ Defines the server port (default: 5005)
const PORT = process.env.PORT;

// ℹ️ Optional for serverless deployments like Vercel.
async function startServer() {
  await connectDB();
 

  app.listen(PORT, () => {
    console.log(`Server listening. Local access on http://localhost:${PORT}`);
  });
}

startServer();
