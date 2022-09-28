const router = require('express').Router();
const Chat = require('../models/chat.model');
const userAuth = require('../utility/userAuth');
// const io = require('../server');
var socket1;

module.exports = function(io) {
    io.on('connection', function(socket) {
        socket.on('message', function(message) {
            logger.log('info',message.value);
            socket.emit('ditConsumer',message.value);
            console.log('from console',message.value);
        });
    });
};

router.route('/').get(userAuth, (req, res) => {
    Chat.find({ $or: [{ sender: req.user.id }, { receiver: req.user.id }] }).populate('users', ['displayName', 'email'])
    .sort({ updatedAt: -1 })
        .then(chats => res.status(200).json(chats))
        .catch(err => res.status(400).json('Error: ' + err));
}
);

router.route('/create-chat').post(userAuth, (req, res) => {
    const { receiver, title } = req.body;
    const users = [req.user.id, receiver];
    const newChat = new Chat({ users, title });
    newChat.save()
        .then((chat) => res.status(200).json(chat))
        .catch(err => res.status(400).json('Error: ' + err));
}
);

router.route('/send-message').post(userAuth, async(req, res) => {
    const { chatId, message } = req.body;
    // console.log(chatId, message);
try {
    let chat = await Chat.findOneAndUpdate({ _id: chatId }, { $push: { messages: { message, sender: req.user.id } }, $set: { updatedAt: Date.now() } }, { new: true })
    console.log(chat.users.filter(user => user._id !== req.user.id)[0]._id.valueOf());
    socket1.to(chat.users.filter(user => user._id !== req.user.id)[0]._id.valueOf()).emit('receive-message', {message : chat.messages[chat.messages.length - 1], chatId});
    res.status(chat ? 200 : 404).json(chat.messages[chat.messages.length - 1] ?? 'Chat not found')
    
} catch (error) {
    res.status(400).json('Error: ' + error)
}
        // .then(chat => res.status(chat ? 200 : 404).json(chat.messages[chat.messages.length - 1] ?? 'Chat not found'))
        // .catch(err => res.status(400).json('Error: ' + err));
        // io.emit('send-message', { chatId, message });
}
);

module.exports = {router, start: function(io) {
    io.on('connection', function(socket) {
        socket.on("join-room", (room) => {
            socket.join(room.id);
              console.log("joined room from chat", room);
        });
        socket1 = socket;
        // socket.on('message', function(message) {
        //     logger.log('info',message.value);
        //     socket.emit('ditConsumer',message.value);
        //     console.log('from console',message.value);
        // });
        console.log('a user connected from chat', socket.id, socket.rooms);
    });
}};
