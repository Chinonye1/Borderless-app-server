const { Schema, model, default: mongoose } = require("mongoose");

// patientschema defines the shape of the document to be received for the patient
const patientSchema = new Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    specialistneeded: {
      type: String,
    },
    description: {
      type: String,
    },
    image: {
      type: String
    },
    document:{
      type: String
    }
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  },
);

const Patient = model("Patient", patientSchema);

module.exports = Patient;
