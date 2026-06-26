// ℹ️ Loads environment variables from a .env file into process.env
try {
  process.loadEnvFile();
} catch (error) {
  console.warn(".env file not found, using default environment values");
}

// Imports Express (a Node.js framework for handling HTTP requests) and initializes the server
const express = require("express");
const app = express();
const router = require("./routes/index.routes");
const Patient = require("./models/Patient.model");
const User = require("./models/User.model");
const Physician = require("./models/Physician.model");

// ℹ️ Loads and applies global middleware (CORS, JSON parsing, etc.) for server configurations
const config = require("./config");
config(app);

async function syncDatabaseIndexes() {
  await Physician.syncIndexes();
}

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

router.post("/users/patient", async (req, res) => {
  try {
    console.log(req.body);

    const newUser = {
      email: req.body.email,
      password: req.body.password,
      fullname: req.body.fullname,
      country: req.body.country,
      languages: req.body.languages,
      age: req.body.age,
      role: req.body.role,
    };

    const createdUser = await User.create(newUser);

    console.log("new user", createdUser);

    const newPatient = {
      user: createdUser._id,
      specialistneeded: req.body.specialistneeded,
      description: req.body.description,
    };
    console.log("new patient", newPatient);
    const createdPatient = await Patient.create(newPatient);

    res.json({ createdPatient, createdUser }).status(200);
  } catch (error) {
    console.log(error);
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
  try {
    console.log(req.body);

    const newUser = {
      email: req.body.email,
      password: req.body.password,
      fullname: req.body.fullname,
      country: req.body.country,
      languages: req.body.languages,
      age: req.body.age,
      role: "physician",
    };

    const createdUser = await User.create(newUser);

    console.log("new user", createdUser);

    const newPhysician = {
      user: createdUser._id,
      specialty: req.body.specialty,
      consultfee: req.body.consultfee,
    };

    const createdPhysician = await Physician.create(newPhysician);

    console.log("new physician", createdPhysician);
    res.json({ createdUser, createdPhysician }).status(200);
  } catch (error) {
    console.log(error);
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

router.put("/users/physician/:physicianId", async(req, res)=>{
  try{
    const physicianId = req.params.physicianId
    const response = await Physician.findByIdAndUpdate({_id: physicianId}, req.body, {new: true})

    res.json(response).status(200)

  }catch(error){
    console.log(error)
  }
})


// ==================DELETE PHYSICIAN BY ID==============
router.delete("/users/physician/:physicianId", async(req, res)=>{
  try{
    const physicianId = req.params.physicianId;
    const response = await Physician.findByIdAndDelete({_id: physicianId})

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
  await syncDatabaseIndexes();

  app.listen(PORT, () => {
    console.log(`Server listening. Local access on http://localhost:${PORT}`);
  });
}

startServer();
