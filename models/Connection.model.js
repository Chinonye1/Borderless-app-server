const mongoose = require("mongoose");
const { Schema, model } = mongoose;



const connectionSchema = new Schema(
    {
  patient: {
    type: mongoose.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  physician: {
    type: mongoose.Types.ObjectId,
    ref: "Physician",
    required: true,
  },
  initiatedBy: {
    type: String,
    enum: ["patient", "physician"],
    required: true
  },
  message: {
    type: String
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "declined"],
    default: "pending"
  }

},
 {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  },


);

const Connection = model("Connection", connectionSchema);

module.exports = Connection;
