const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const departmentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    code: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    head: {
      type: mongoose.Types.ObjectId,
      ref: "Physician",
    },

    location: {
      type: String,
      trim: true,
    },

    image: {
      type: String,
    },

    specialties: {
      type: [String],
      default: [],
    },

    icon: {
      type: String,
    },

    color: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  },
);

const Department = model("Department", departmentSchema)

module.exports = Department;