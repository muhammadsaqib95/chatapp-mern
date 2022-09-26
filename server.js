const moongose = require("mongoose");
const express = require("express");
const cors = require("cors");
const http = require('http');
const app = express();
require("dotenv").config();
const multer = require("multer");
var upload = multer({ dest: "uploads/" });
const { Server } = require("socket.io");

app.use(cors());
const server = http.createServer(app);
app.use(express.json());
app.use(upload.array());
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

// const app = express();
const port = process.env.PORT || 3001;
app.get("/", (req, res) => {
  res.send("Hello World");
});
io.on("connection", (socket) => {
  console.log("a user connected", socket.id, socket.rooms);
  socket.on("join", (room) => {
    socket.join(room);
    console.log("joined room", room);
  });
  socket.on("send-message", (data) => {
    console.log("user send message",data);
  });

  socket.on("disconnect", (da) => {
    console.log("user disconnected", socket.id);
  }
  );
});


const uri = process.env.MONGODB_URI;
moongose.connect(uri);
const connection = moongose.connection;
connection.once("open", (res) => {
  console.log("MongoDB database connection established successfully");
});

// const socket = require("socket.io-client")(":3001/socket");
// console.log(socket.connected); // true

// socket.on("connect_error", (err) => {
//   console.log(`connect_error due to ${err.message}`);
// });

const userRouter = require("./routes/user");
const chatRouter = require("./routes/chat");
app.use("/user", userRouter);
app.use("/chat", chatRouter);

server.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
