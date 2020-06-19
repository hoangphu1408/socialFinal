const mongoose = require("mongoose");
const Schema = require("mongoose").Schema;

const residentSchema = new Schema({
  //! Tên đầy dủ
  full_name: {
    type: String,
    trim: true,
    required: true,
  },
  //! Năm sinh
  year_of_birth: {
    type: Number,
    default: 1900,
  },
  //! Thông tin cá nhân
  private_information: {},
  //! Hộ khẩu
  household_registration: {
    type: String,
    enum: ["temporary_resident", "permanent_resident", "none"],
  },
  //! Ngày tạo
  date: {
    type: String,
    required: true,
  },
  //! Trạng thái
  status: {
    type: Boolean,
  },
});

module.exports = mongoose.model("resident", residentSchema);
