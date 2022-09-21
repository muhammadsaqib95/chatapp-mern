const moongose = require('mongoose');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const multer = require('multer');
var upload = multer({ dest: "uploads/" });

const app = express();
const port = process.env.PORT || 9000;

app.use(cors());
app.use(express.json());
app.use(upload.array());
app.get('/',(req,res) => {
    res.send('Hello World');
    });

const uri = process.env.MONGODB_URI;
moongose.connect(uri);
const connection = moongose.connection;
connection.once('open', (res) => {
    console.log('MongoDB database connection established successfully');
})

const userRouter = require('./routes/user');

app.use('/user', userRouter);

app.listen(port , () => {
    console.log(`Server is running on port: ${port}`);
})