const { Schema, model, default: mongoose } = require("mongoose");


const physicianSchema = new Schema(
  {
    name: {
        type: String,
        required: [true, 'Password is required.']

    },
    location: {
        type: String,

    },
   
    specialty: {
        type: String
    },
    languages: {
        type: String
    },
    consultfee: {
        type: Number

    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User" 
    }
    
   


  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`    
    timestamps: true
  }
);

const Physician = model("Physician", physicianSchema);

module.exports = Physician;
