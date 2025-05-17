const express = require("express");
const router = express.Router();
const authMw = require("../middleware/auth");
const _ = require("lodash");
const {
  Card,
  cardValidation,
  generateBizNumber,
  cardUpdateValidation,
  bizNumberValidation,
} = require("../model/card");

router.post("/", authMw, async (req, res) => {
  // input validation
  const { error } = cardValidation.validate(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }
  // system validation
  console.log(req.user.isBusiness);

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
      res
        .status(400)
        .send(
          `The input field "${field}", with the value "${value}", already exist.`
        );
      return;
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

router.get("/:id", async (req, res) => {
  const card = await Card.findOne({ _id: req.params.id });
  if (!card) {
    res.status(400).send("No card found.");
    return;
  }
  res.send(card);
});

router.put("/:id", authMw, async (req, res) => {
  const { error } = cardUpdateValidation.validate(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }
  const card = await Card.findOne({ _id: req.params.id });
  if (!card) {
    res.status(400).send("No card found.");
    return;
  }
  if (card.user_id.toString() === req.user._id) {
    res.status(400).send("Access denied");
    return;
  }
  const updatedCard = await Card.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );
  res.send(updatedCard);
});

router.patch("/:id", authMw, async (req, res) => {
  const card = await Card.findById({ _id: req.params.id });
  if (!card) {
    res.status(400).send("No card found.");
    return;
  }
  if (card.likes.includes(req.user._id)) {
    const removeLike = await Card.findByIdAndUpdate(
      { _id: req.params.id },
      { $pull: { likes: req.user._id } },
      { new: true }
    );
    res.send(removeLike);
    return;
  }
  const addLike = await Card.findByIdAndUpdate(
    { _id: req.params.id },
    { $push: { likes: req.user._id } },
    { new: true }
  );
  res.send(addLike);
});

router.delete("/:id", authMw, async (req, res) => {
  try {
    let card = await Card.findById({ _id: req.params.id });
    if (!card) {
      res.status(400).send("No card found");
      return;
    }

    if (card.user_id.toString() !== req.user._id) {
      res.status(400).send("Access denied");
      return;
    }
    card = await Card.findByIdAndDelete({ _id: req.params.id });
    res.send(card);
  } catch (err) {
    res.status(500).send("Something went wrong.");
  }
});

router.patch("/biz-number/:id", authMw, async (req, res) => {
  const { error } = bizNumberValidation.validate(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }

  if (!req.user.isAdmin) {
    res.status(400).send("Access denied");
    return;
  }
  try {
    let card = await Card.findById({ _id: req.params.id });
    if (!card) {
      res.status(400).send("No card found.");
      return;
    }
    card = await Card.findByIdAndUpdate(
      { _id: req.params.id },
      { $set: { bizNumber: req.body.bizNumber } },
      { new: true, runValidators: true }
    );
    res.send(card);
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const value = err.keyValue[field];
      res
        .status(400)
        .send(
          `The input field "${field}", with the value "${value}", already exist.`
        );
      return;
    }
  }
});

module.exports = router;
