const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fileLogger = require("../fileLogger/fileLogger");
const { User, signInValidation } = require("../model/user");
const logger = require("../fileLogger/fileLogger");

router.post("/", async (req, res) => {
  // input validation
  const { error } = signInValidation.validate(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    logger.error(
      `status: ${res.statusCode} | Message: ${error.details[0].message}`
    );
    return;
  }
  // system validation
  let user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(400).send("Invalid email.");
    logger.error(
      `status: ${res.statusCode} | Message: Login denied, invalid Email.`
    );
    return;
  }

  if (user.isLocked()) {
    if (user.lockUntil && user.lockUntil < Date.now()) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();
    } else {
      res.status(403).send("The account is locked. Try again later.");
      logger.warn(
        `status: ${res.statusCode} | Message: The user account have been locked`
      );
      return;
    }
  }

  const isValidPassword = await bcrypt.compare(
    req.body.password,
    user.password
  );

  if (!isValidPassword) {
    user.loginAttempts += 1;

    if (user.loginAttempts >= 3) {
      user.lockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
      res.status(400);
      logger.warn(
        `status: ${res.statusCode} | Message: User account cooldown for 24 hours`
      );
    }
    await user.save();

    res.status(400).send("Invalid password");
    logger.error(
      `status: ${res.statusCode} | Message: Login denied, Invalid password.`
    );
    return;
  }

  // process
  const token = jwt.sign(
    { _id: user._id, isBusiness: user.isBusiness, isAdmin: user.isAdmin },
    process.env.JWT_KEY
  );
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();

  // response
  res.status(200).send({ token });
  logger.info(
    `status: ${res.statusCode} | Message: User login successfully, token provided.`
  );
});

module.exports = router;
