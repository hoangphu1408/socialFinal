const mongoose = require("mongoose");
const Schema = require("mongoose").Schema;

const accountSchema = new Schema({
  id_resident: {
    type: Schema.Types.ObjectId,
  },
  role: {
    type: String,
    required: true,
    default: "user",
    enum: ["user", "admin", "boss"],
  },
  username: {
    type: String,
    trim: true,
  },
  avatar: {},
  email: {
    type: String,
    default: null,
    lowercase: true,
    unique: true,
    trim: true,
  },
  email_verify: {
    type: Boolean,
    default: false,
  },
  phoneNumber: {
    type: String,
    default: null,
    trim: true,
    min: 12,
    max: 12,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
  },
});

module.exports = mongoose.model("account", accountSchema);
