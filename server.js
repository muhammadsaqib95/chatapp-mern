const moongose = require("mongoose");
const express = require("express");
const cors = require("cors");
const http = require('http');
const app = express();
require("dotenv").config();
const multer = require("multer");
var upload = multer({ dest: "uploads/" });
const { Server } = require("socket.io");
const { instrument } = require("@socket.io/admin-ui");
const jwt  = require("jsonwebtoken");

app.use(cors(
{
    origin: ["*", 'https://admin.socket.io', 'http://localhost:3000'],
    methods: ["GET", "POST", "PUT", "DELETE"],

}

));
const server = http.createServer(app);
app.use(express.json());
app.use(upload.array());
const io = new Server(server, {
    cors: {
        origin: ["*", 'https://admin.socket.io', 'http://localhost:3000'],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    },
});

// const app = express();
const port = process.env.PORT || 3001;
app.get("/", (req, res) => {
  res.send("This is chat app home");
});
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('authentication error'));
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = verified;
    return next();
});

// io.on("connection", (socket) => {
//   socket.on("disconnect", (da) => {
//     console.log("user disconnected", socket.id);
//   }
//   );
// });


const uri = process.env.MONGODB_URI;
moongose.connect(uri,{ dbName: 'chatapp' });
const connection = moongose.connection;
connection.once("open", () => {
  console.log("MongoDB database connection established successfully");
  // console.log(moongose);
});

// const socket = require("socket.io-client")(":3001/socket");
// console.log(socket.connected); // true

// socket.on("connect_error", (err) => {
//   console.log(`connect_error due to ${err.message}`);
// });

const userRouter = require("./routes/user");
const chatRouter = require("./routes/chat");
chatRouter.start(io)
app.use("/user", userRouter);
app.use("/chat", chatRouter.router);

instrument(io, {
  auth: false
});

server.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

