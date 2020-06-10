const { Schema, model } = require("mongoose");

const postSchema = new Schema({
  id_acc: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  content: {
    type: String,
  },
  image: {},
  type: {
    type: String,
    default: "public",
    enum: ["public", "announce", "sell"],
  },
  status: {
    type: Boolean,
  },
  date: {
    type: String,
    required: true,
  },
});

module.exports = model("post", postSchema);