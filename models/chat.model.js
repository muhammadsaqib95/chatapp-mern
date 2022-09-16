const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const chatSchema = new Schema({
  title: { type: String },
  messages: [{ type: Schema.Types.Mixed }],
  users: [{ type: Schema.Types.ObjectId, ref : "User", required: true }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;