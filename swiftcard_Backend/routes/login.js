const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, userValidate, signInValidation } = require("../model/user");
const authMw = require("../middleware/auth");

router.post("/", async (req, res) => {
  // input validation
  const { error } = signInValidation.validate(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }
  // system validation
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(400).send("Invalid email.");
    return;
  }
  const isValidPassword = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!isValidPassword) {
    res.status(400).send("Invalid password");
    return;
  }
  // process
  const token = jwt.sign(
    { _id: user._id, isBusiness: user.isBusiness, isAdmin: user.isAdmin },
    process.env.JWT_KEY
  );
  // response
  res.send({ token });
});

module.exports = router;
