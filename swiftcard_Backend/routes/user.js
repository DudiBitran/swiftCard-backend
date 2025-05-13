const { User, userValidate, updateValidation } = require("../model/user");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const authMw = require("../middleware/auth");
const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  //validation user input
  const { error } = userValidate.validate(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }

  //validate system
  let user = await User.findOne({ email: req.body.email });
  if (user) {
    res.status(400).send("User already exist.");
    return;
  }
  //process
  user = await new User({
    ...req.body,
    password: await bcrypt.hash(req.body.password, 14),
  }).save();

  //response
  res.send(_.pick(user, ["name", "email", "_id", "createdAt"]));
});

router.get("/:id", authMw, async (req, res) => {
  try {
    const requestedUserId = req.params.id;
    const currentUserId = req.user._id;
    const isAdmin = req.user.isAdmin;

    if (requestedUserId !== currentUserId && !isAdmin) {
      res.status(400).send("Access denied.");
      return;
    }

    const user = await User.findById(requestedUserId);
    if (!user) {
      res.status(400).send("User not found.");
      return;
    }
    res.send(user);
  } catch {
    res.status(500).send("Server Error");
  }
});

router.get("/", authMw, async (req, res) => {
  if (!req.user.isAdmin) {
    res.status(400).send("Access denied.");
    return;
  }

  const allUsers = await User.find();
  if (!allUsers) {
    res.status(400).send("No user found.");
    return;
  }
  res.send(allUsers);
});

router.put("/:id", authMw, async (req, res) => {
  // input validate
  const { error } = updateValidation.validate(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }
  // system validate
  if (req.params.id !== req.user._id) {
    res.status(400).send("Access denied");
    return;
  }
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(400).send("User not found");
    return;
  }
  if (req.body.email) {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser && existingUser._id.toString() !== req.user._id) {
      res.status(400).send("Email already in used.");
      return;
    }
  }

  // process
  await User.updateOne(
    { _id: req.user._id },
    { $set: req.body },
    { new: true, runValidators: true }
  );
  const updatedUser = await User.findById(req.user._id);
  // response

  res.send(updatedUser);
});

module.exports = router;
