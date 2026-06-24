// ℹ️ Loads environment variables from a .env file into process.env
try {
  process.loadEnvFile();
} catch (error) {
  console.warn(".env file not found, using default environment values");
}

// Imports Express (a Node.js framework for handling HTTP requests) and initializes the server
const express = require("express");
const app = express();

// ℹ️ Loads and applies global middleware (CORS, JSON parsing, etc.) for server configurations
const config = require("./config");
config(app);

// ℹ️ Middleware that establishes a database connection. Ensures the connection is created on every request. Required for serverless deployments.
const connectDB = require("./db");
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// ℹ️ Test Route. Can be left and used for waking up the server if idle
app.get("/", (req, res, next) => {
  res.json("All good in here");
});

app.get("/department/:departmentId", (req, res) => {
  console.log("req.body", req.body);
  console.log("req.params", req.params);
  console.log("req.query", req.query);

  res.send("You can search for departments here");
});

// CRUD Operations for users
const User = require("./models/User.model");

app.post("/users", async (req, res) => {

  try{

  
  console.log(req.body);

  const newUser = {
    email: req.body.email,
    password: req.body.password
  };
  

  const createdUser= await User.create(newUser);

  res.send("testing /users");

  }catch(error){
    console.log(error)
  }
});

// CRUD Operations for patients
const Patient = require("./models/Patient.model");

app.post("/users/patient", async (req, res)=>{

  try{

  const newPatient = {
    name: req.body.name,
    country: req.body.country,
      age: req.body.age,
      specialistneeded: req.body.specialistneeded,
      description:req.body.description


  }

  const createdPatient = await Patient.create(newPatient)

  res.send("new patient created")
}catch(error){
  console.log(error)
}
})

// CRUD Operations for Physicians
const Physician = require("./models/Physician.model");



// 👇 Defines and applies route handlers
const indexRouter = require("./routes/index.routes");
app.use("/api", indexRouter);

// ❗ Centralized error handling (must be placed after routes)
const handleErrors = require("./errors");
handleErrors(app);

// ℹ️ Defines the server port (default: 5005)
const PORT = process.env.PORT || 5005;

// ℹ️ Optional for serverless deployments like Vercel.
app.listen(PORT, () => {
  console.log(`Server listening. Local access on http://localhost:${PORT}`);
});
