const mongoose = require("mongoose");
const Schema = require("mongoose").Schema;

const residentSchema = new Schema({
  full_name: {
    type: String,
    trim: true,
    required: true,
  },
  year_of_birth: {
    type: Number,
    default: 1900,
  },
  private_information: {},
  household_registration: {
    type: String,
    enum: ["temporary_resident", "permanent_resident", "none"],
  },
  date: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
  },
});

module.exports = mongoose.model("resident", residentSchema);
