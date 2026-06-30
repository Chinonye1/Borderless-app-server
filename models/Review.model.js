const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const reviewSchema = new Schema(
  {
    patient: {
      type: mongoose.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    department: {
      type: mongoose.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  {
    // adds createdAt and updatedAt
    timestamps: true,
  },
);

const Review = model("Review", reviewSchema);

module.exports = Review;
