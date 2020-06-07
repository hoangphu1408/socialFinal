const mongoose = require("mongoose");
const Schema = require("mongoose").Schema;

const flatSchema = new Schema({
  block: {
    type: String,
    required: true,
  },
  floorId: {
    type: String,
    required: true,
  },
  flatId: {
    type: String,
    required: true,
  },
  owner: { type: Schema.Types.ObjectId },
  numberOfPeople: [Schema.Types.ObjectId],
  date: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
  },
});

module.exports = mongoose.model("flat", flatSchema);
