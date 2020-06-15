const mongoose = require("mongoose");
const { model } = require("./account");
const Schema = require("mongoose").Schema;

const billSchema = new Schema({
  id_flat: {
    type: Schema.Types.ObjectId,
  },
  last_read: {
    type: Number,
  },
  current_read: {
    type: Number,
  },
  current: {
    type: Number,
  },
  usage: {
    type: Number,
  },
  free: {
    type: Number,
  },
  total_cost: {
    type: Number,
  },
  type: {
    type: String,
    enum: ["electric", "water"],
  },
  last_date: {
    type: String,
  },
  date: {
    type: String,
    required: true,
  },
  expiration_date: {
    type: String,
  },
  status: {
    type: Boolean,
  },
});

module.exports = mongoose.model("bill", billSchema);
