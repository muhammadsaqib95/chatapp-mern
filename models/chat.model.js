const mongoose = require("mongoose");
const User = require("./user.model");
const Schema = mongoose.Schema;

const chatSchema = new Schema({
  title: { type: String },
  messages: [
    {
      id: Schema.Types.ObjectId,
      message: String,
      sender: Schema.Types.ObjectId,
      sentAt: { type: Date, default: Date.now },
    },
  ],
  users: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
