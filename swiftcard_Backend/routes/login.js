const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, signInValidation } = require("../model/user");

router.post("/", async (req, res) => {
  // input validation
  const { error } = signInValidation.validate(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }
  // system validation
  let user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(400).send("Invalid email.");
    return;
  }

  if (user.isLocked()) {
    if (user.lockUntil && user.lockUntil < Date.now()) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();
    } else {
      res.status(403).send("The account is locked. Try again later.");
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
    }

    await user.save();
    res.status(400).send("Invalid password");
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
  res.send({ token });
});

module.exports = router;
