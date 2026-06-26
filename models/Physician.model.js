const { Schema, model, default: mongoose } = require("mongoose");

const physicianSchema = new Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    department: {
      type: mongoose.Types.ObjectId,
      ref: "Department",
      required: true

    },

    specialty: {
      type: String,
    },

    consultfee: {
      type: Number,
    },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  },
);

const Physician = model("Physician", physicianSchema);

module.exports = Physician;
