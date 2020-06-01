const mongoose = require("mongoose");
const Schema = require("mongoose").Schema;

const residentSchema = new Schema({
  first_name: {
    type: String,
    trim: true,
    lowercase: true,
    required: true,
  },
  last_name: {
    type: String,
    trim: true,
    lowercase: true,
    required: true,
  },
  year_of_birth: {
    type: String,
  },
  private_information: [
    {
      ID_card: {
        type: String,
        min: 9,
        max: 12,
        trim: true,
      },
      birth_certificate: [
        {
          father_name: {
            type: String,
            trim: true,
            lowercase: true,
          },
          mother_name: {
            type: String,
            trim: true,
            lowercase: true,
          },
        },
      ],
      required: true,
    },
  ],
  household_registration: [
    {
      temporary_resident: {
        type: Boolean,
      },
      permanent_resident: {
        type: Boolean,
      },
      required: true,
    },
  ],
  date: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("resident", residentSchema);
