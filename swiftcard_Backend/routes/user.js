const { User, userValidate, updateValidation } = require("../model/user");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const authMw = require("../middleware/auth");
const express = require("express");
const router = express.Router();
const logger = require("../fileLogger/fileLogger");

router.post("/", async (req, res) => {
  //validation user input
  const { error } = userValidate.validate(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    logger.error(
      `status: ${res.statusCode} | Message:${error.details[0].message}`
    );
    return;
  }

  //validate system
  let user = await User.findOne({ email: req.body.email });
  if (user) {
    res.status(400).send("User already exist.");
    logger.error(`status: ${res.statusCode} | Message: User already exist.`);
    return;
  }
  //process
  user = await new User({
    ...req.body,
    password: await bcrypt.hash(req.body.password, 14),
    loginAttempts: 0,
    lockUntil: undefined,
  }).save();

  //response
  res.send(_.pick(user, ["name", "email", "_id", "createdAt"]));
  logger.info(
    `status: ${res.statusCode} | Message: User registered successfully.`
  );
});

router.get("/:id", authMw, async (req, res) => {
  try {
    const requestedUserId = req.params.id;
    const currentUserId = req.user._id;
    const isAdmin = req.user.isAdmin;

    if (requestedUserId !== currentUserId && !isAdmin) {
      res.status(400).send("Access denied.");
      logger.error(`status: ${res.statusCode} | Message: Access denied.`);
      return;
    }

    const user = await User.findById(requestedUserId);
    if (!user) {
      res.status(400).send("User not found.");
      logger.error(`status: ${res.statusCode} | Message: User not found.`);
      return;
    }
    res.send(user);
    logger.info(
      `status: ${res.statusCode} | Message: User have been sent successfully.`
    );
  } catch {
    res.status(500).send("Server Error.");
    logger.info(`status: ${res.statusCode} | Message: Server Error.`);
  }
});

router.get("/", authMw, async (req, res) => {
  if (!req.user.isAdmin) {
    res.status(400).send("Access denied.");
    logger.error(`status: ${res.statusCode} | Message: Access denied.`);
    return;
  }

  const allUsers = await User.find();
  if (allUsers.length === 0) {
    res.status(400).send("No user found.");
    logger.error(`status: ${res.statusCode} | Message: No user found.`);
    return;
  }
  res.send(allUsers);
  logger.info(
    `status: ${res.statusCode} | Message: Users have been sent successfully.`
  );
});

router.put("/:id", authMw, async (req, res) => {
  // input validate
  const { error } = updateValidation.validate(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    logger.error(
      `status: ${res.statusCode} | Message: ${error.details[0].message}`
    );
    return;
  }
  // system validate
  if (req.params.id !== req.user._id) {
    res.status(400).send("Access denied.");
    logger.error(`status: ${res.statusCode} | Message: Access denied.`);
    return;
  }
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(400).send("User not found");
    logger.error(`status: ${res.statusCode} | Message: User not found.`);
    return;
  }
  if (req.body.email) {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser && existingUser._id.toString() !== req.user._id) {
      res.status(400).send("Email already in use.");
      logger.error(
        `status: ${res.statusCode} | Message: Email already in use.`
      );
      return;
    }
  }

  // process
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: req.body },
    { new: true, runValidators: true }
  );
  // response

  res.send(updatedUser);
  logger.info(
    `status: ${res.statusCode} | Message: User details updated successfully.`
  );
});

router.patch("/:id", authMw, async (req, res) => {
  // input validation
  if (req.user._id !== req.params.id) {
    res.status(400).send("Access denied.");
    logger.error(
      `status: ${res.statusCode} | Message: User not the owner, access denied.`
    );
    return;
  }
  // system validation
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(400).send("User not found.");
    logger.error(`Status: ${res.statusCode} | Message: User not found.`);
    return;
  }
  // process
  const userStatusUpdated = await User.findByIdAndUpdate(
    req.params.id,
    { $set: { isBusiness: !user.isBusiness } },
    { new: true, runValidators: true }
  );
  // response
  res.send(userStatusUpdated);
  logger.info(`
    status: ${res.statusCode} |
    Message: "User changed business status successfully."
  `);
});

router.delete("/:id", authMw, async (req, res) => {
  // input validation
  if (req.user._id !== req.params.id && !req.user.isAdmin) {
    res.status(400).send("Access denied.");
    logger.error(`status: ${res.statusCode} | Message: Access denied.`);
    return;
  }
  // system validation
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(400).send("User not found.");
    logger.error(`status: ${res.statusCode} | Message: User not found.`);
    return;
  }
  // process
  const deletedUser = await User.findByIdAndDelete(req.params.id);
  // response
  res.send(deletedUser);
  logger.info(
    `status: ${res.statusCode} | Message: User deleted successfully.`
  );
});

module.exports = router;
