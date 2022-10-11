const router = require("express").Router();
const Chat = require("../models/chat.model");
const userAuth = require("../utility/userAuth");
var socket1;
router.route("/").get(userAuth, (req, res) => {
  Chat.find({ users: req.user.id })
    .populate("users", ["displayName", "email", "isOnline", "updatedAt"])
    .sort({ updatedAt: -1 })
    .then((chats) => res.status(200).json(chats))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/create-chat").post(userAuth, (req, res) => {
  const { receiver, title } = req.body;
  const users = [req.user.id, receiver];
  const newChat = new Chat({ users, title });
  newChat
    .save()
    .then((chat) => res.status(200).json(chat))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/send-message").post(userAuth, async (req, res) => {
  const { chatId, message, receiverId } = req.body;
  if (receiverId) {
    const users = [req.user.id, receiverId];
    const newChat = new Chat({ users, title, message });

    let chat = await newChat.save();
    socket1
      .in(chat.users.filter((user) => user._id != req.user.id)[0]._id.valueOf())
      .emit("new-chat", { chat });
    res.status(chat ? 200 : 404).json(chat ?? "Chat not found");
  } else {
    try {
      let chat = await Chat.findOneAndUpdate(
        { _id: chatId },
        {
          $push: { messages: { message, sender: req.user.id } },
          $set: { updatedAt: Date.now() },
        },
        { new: true }
      );
      socket1
        .in(
          chat.users.filter((user) => user._id != req.user.id)[0]._id.valueOf()
        )
        .emit("receive-message", {
          message: chat.messages[chat.messages.length - 1],
          chatId,
        });
      res
        .status(chat ? 200 : 404)
        .json(chat.messages[chat.messages.length - 1] ?? "Chat not found");
    } catch (error) {
      res.status(400).json("Error: " + error);
    }
  }
});

module.exports = {
  router,
  start: function (io) {
    socket1 = io;
    socket1.on("connection", function (socket) {
      // console.log('a user connected', socket.user.id);
      // User.findByIdAndUpdate(socket.user.id, { $set: { isOnline: true } }, { new: true })
      // .then(user => {
      //     // console.log(user , ' is online');
      //     socket.broadcast.emit('user-online', user._id);
      // })
      socket.on("join-room", (room) => {
        socket.join(room.id);
        //   console.log("joined room from chat", room);
      });
      // socket.on('disconnect', function() {
      //     console.log('user disconnected', socket.user.id);
      //     User.findByIdAndUpdate(socket.user.id, { $set: { isOnline: false } }, { new: true })
      //     .then(user => {
      //         // console.log(user , ' is offline');
      //         socket.broadcast.emit('user-offline', user._id);
      //     })
      // });
      // console.log('a user connected from chat', socket.id, socket.rooms);
    });
  },
};
