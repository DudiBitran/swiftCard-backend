const express = require("express");
const router = express.Router();
const authMw = require("../middleware/auth");
const { Card, cardValidation } = require("../model/card");
router.post("/", authMw, async (req, res) => {
  // input validation
  const { error } = cardValidation.validate(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }
  // system validation
  if (!req.user.isBusiness) {
    res.status(400).send("Access denied");
    return;
  }
  // process
  const card = await new Card({
    ...req.body,
    user_id: req.user._id,
  }).save();

  // response
  res.send(card);
});

router.get("/", async (req, res) => {
  // system validation
  // process
  // response
});

module.exports = router;
