const { Schema, model } = require("mongoose");

// patientschema defines the shape of the document to be received for the patient
const patientSchema = new Schema(
  {
    name: {
        type: String,
        required: [true, 'Password is required.']

    },
    country: {
        type: String

    },
    age: {
        type: Number
    },
    specialistneeded: {
        type: String
    },
    description: {
        type: String
    }

   


  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`    
    timestamps: true
  }
);

const Patient = model("Patient", patientSchema);

module.exports = Patient;
