const mongoose = require("mongoose");
const Schema = require("mongoose").Schema;

const accountSchema = new Schema({
  //! Id cư dân
  id_resident: {
    type: Schema.Types.ObjectId,
  },
  //! Vai trò
  role: {
    type: String,
    required: true,
    default: "user",
    enum: ["user", "admin", "boss"],
  },
  //! Tên tài khoản
  username: {
    type: String,
    trim: true,
  },
  //! Ảnh hồ sơ
  avatar: {},
  //! Email
  email: {
    type: String,
    default: null,
    lowercase: true,
    unique: true,
    trim: true,
  },
  //! Xác thực mail
  email_verify: {
    type: Boolean,
    default: false,
  },
  //! Số điện thoại
  phoneNumber: {
    type: String,
    default: null,
    trim: true,
    min: 12,
    max: 12,
  },
  //! Mật khẩu
  password: {
    type: String,
    required: true,
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

module.exports = mongoose.model("account", accountSchema);
