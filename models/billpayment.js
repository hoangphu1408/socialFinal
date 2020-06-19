const mongoose = require("mongoose");
const { model } = require("./account");
const Schema = require("mongoose").Schema;

const billSchema = new Schema({
  //! Id căn hộ
  id_flat: {
    type: Schema.Types.ObjectId,
  },
  //! Chỉ số cũ
  last_read: {
    type: Number,
  },
  //! Chỉ số hiện tại
  current_read: {
    type: Number,
  },
  //! Số hiện tại
  current: {
    type: Number,
  },
  //! Đã dùng
  usage: {
    type: Number,
  },
  //! Miễn phí
  free: {
    type: Number,
  },
  //! Tổng tiền
  total_cost: {
    type: Number,
  },
  //! Loại
  type: {
    type: String,
    enum: ["electric", "water"],
  },
  //! Tháng vừa rồi
  last_date: {
    type: String,
  },
  //! Ngày tạo
  date: {
    type: String,
    required: true,
  },
  //! Ngày hết hạn
  expiration_date: {
    type: String,
  },
  //! Trạng thái
  status: {
    type: Boolean,
  },
});

module.exports = mongoose.model("bill", billSchema);
