const router = require('express').Router();
const Chat = require('../models/chat.model');
const userAuth = require('../utility/userAuth');

router.route('/').get(userAuth, (req, res) => {
    Chat.find({ $or: [{ sender: req.user.id }, { receiver: req.user.id }] }).populate('users', ['displayName', 'email'])
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

router.route('/send-message').post(userAuth, (req, res) => {
    const { chatId, message } = req.body;
    console.log(chatId, message);
    Chat.findOneAndUpdate({ _id: chatId }, { $push: { messages: { message, sender: req.user.id } } })
        .then(chat => res.status(chat ? 200 : 404).json(chat ?? 'Chat not found'))
        .catch(err => res.status(400).json('Error: ' + err));
}
);

module.exports = router;