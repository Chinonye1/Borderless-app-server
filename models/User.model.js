// ❗This is an example of a User Model.
// TODO: Please make sure you edit the User model to whatever makes sense in your project.

const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
    
    },
    fullname: {
      type: String,
      required: true

    },
    age: {
      type: Number
    },
    country: {
      type: String
    },
    languages: {
      type: [String]
    },

    role: {
      type: String,
      enum: ["patient", "physician"], // only these two are allowed
      required: true,
      default: "patient",
    },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  },
);

// Hash the password before saving, but only if it has changed (so updates that
// don't touch the password don't rehash an already hashed value).
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

const User = model("User", userSchema);

module.exports = User;
