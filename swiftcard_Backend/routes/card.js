const express = require("express");
const router = express.Router();
const authMw = require("../middleware/auth");
const _ = require("lodash");
const { Card, cardValidation, generateBizNumber } = require("../model/card");
const { object } = require("joi");
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
  try {
    const card = await new Card({
      ...req.body,
      user_id: req.user._id,
      bizNumber: await generateBizNumber(),
    }).save();
    res.send(card);
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const value = err.keyValue[field];
      throw new Error(
        `The input field ${field}, with the value ${value}, already exist.`
      );
    }
  }
});

router.get("/", async (req, res) => {
  const cards = await Card.find();
  if (cards.length === 0) {
    res.status(400).send("No card found.");
    return;
  }
  res.send(cards);
});

router.get("/my-cards", authMw, async (req, res) => {
  const myCards = await Card.find({ user_id: req.user._id });
  if (!myCards || myCards.length === 0) {
    res.status(400).send("No card found.");
    return;
  }
  res.send(myCards);
});

//לבצע בדיקה מעמיקה
router.get("/:id", async (req, res) => {
  const card = await Card.findOne({ _id: req.params.id });
  if (!card) {
    res.status(400).send("No card found.");
    return;
  }
  res.send(card);
});

module.exports = router;
