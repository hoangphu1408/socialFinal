const mongoose = require("mongoose");
const Schema = require("mongoose").Schema;

const flatSchema = new Schema({
  //! Khu
  block: {
    type: String,
    required: true,
  },
  //! Id Tầng
  floorId: {
    type: String,
    required: true,
  },
  //! Id căn hộ
  flatId: {
    type: String,
    required: true,
  },
  //! Chủ sở hữu
  owner: { type: Schema.Types.ObjectId },
  //! Số nhân khẩu
  numberOfPeople: [Schema.Types.ObjectId],
  //! Ngày tạo
  date: {
    type: String,
    required: true,
  },
  //! Tình trạng
  status: {
    type: Boolean,
  },
});

module.exports = mongoose.model("flat", flatSchema);
