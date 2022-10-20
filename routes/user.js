const router = require("express").Router();
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userAuth = require("../utility/userAuth");
const sendMail = require("../utility/mailSender");

router.route("/").get((req, res) => {
  User.find()
    .then((users) => res.status(200).json(users))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/singup").post(async (req, res) => {
  const { email, password, displayName } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ email, password: hashedPassword, displayName });

  newUser
    .save()
    .then(() => res.status(200).json("User added!"))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/getUser").get(userAuth, async (req, res) => {
  User.findById(req.user.id)
    .then((user) =>
      res
        .status(user ? 200 : 404)
        .json(
          user
            ? { id: user.id, displayName: user.displayName, email: user.email }
            : "User not found"
        )
    )
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/login").post(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user)
    return res
      .status(400)
      .json({ msg: "No account with this email has been registered." });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ msg: "Invalid credentials." });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({
    token,
    user: {
      id: user._id,
      displayName: user.displayName,
      email: user.email,
    },
  });
});

router.route("/update").post(async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  User.findOneAndUpdate({ email }, { password: hashedPassword })
    .then((user) => res.status(user ? 200 : 404).json(user ?? "User not found"))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/forgetPassword").post(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user)
    return res
      .status(400)
      .json({ msg: "No account with this email has been registered." });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  const result = await sendMail(
    email,
    "Password Reset",
    `Your password reset link is : http://localhost:3000/resetPassword/${user._id}/${token}`
  );
  res
    .status(result ? 200 : 400)
    .json(
      result
        ? "Password reset link sent to your email"
        : "Error sending password reset link"
    );
});

router.route("/:name").get((req, res) => {
  let name = req.params.name.trim();
  User.find({
    $or: [
      { displayName: { $regex: name, $options: "i" } },
      { email: { $regex: name, $options: "i" } },
    ],
  })
    .then((users) =>
      res
        .status(200)
        .json(
          users.map((user) => ({
            displayName: user.displayName,
            email: user.email,
            id: user._id,
          }))
        )
    )
    .catch((err) => res.status(400).json("Error: " + err));
});

module.exports = router;
