const { Schema, model } = require("mongoose");

const postSchema = new Schema({
  //! Id tài khoản
  id_acc: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  //! Nội dung
  content: {
    type: String,
  },
  //! Hình ảnh
  image: {},
  //! Thể loại
  type: {
    type: String,
    default: "public",
    enum: ["public", "announce", "sell"],
  },
  //! Trạng thái
  status: {
    type: Boolean,
  },
  //! Ngày tạo
  date: {
    type: String,
    required: true,
  },
});

module.exports = model("post", postSchema);
