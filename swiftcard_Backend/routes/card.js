const express = require("express");
const router = express.Router();
const authMw = require("../middleware/auth");
const _ = require("lodash");
const logger = require("../fileLogger/fileLogger");
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
    logger.error(
      `status: ${res.statusCode} | Message: ${error.details[0].message}`
    );
    return;
  }
  // system validation
  if (!req.user.isBusiness) {
    res.status(400).send("Access denied.");
    logger.error(`status: ${res.statusCode} | Message: Access denied.`);
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
    logger.info(
      `status: ${res.statusCode} | Message: Card created successfully.`
    );
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const value = err.keyValue[field];
      res
        .status(400)
        .send(
          `The input field "${field}", with the value "${value}", already exist.`
        );
      logger.error(
        `status: ${res.statusCode} | Message: The input field "${field}", with the value "${value}", already exist.`
      );
      return;
    }
  }
});

router.get("/", async (req, res) => {
  const cards = await Card.find();
  if (cards.length === 0) {
    res.status(400).send("No card found.");
    logger.error(`status: ${res.statusCode} | Message: No card found.`);
    return;
  }
  res.send(cards);
  logger.info(
    `status: ${res.statusCode} | Message: Cards have been sent successfully.`
  );
});

router.get("/my-cards", authMw, async (req, res) => {
  const myCards = await Card.find({ user_id: req.user._id });
  if (!myCards || myCards.length === 0) {
    res.status(400).send("No card found.");
    logger.error(`status: ${res.statusCode} | Message: No card found.`);
    return;
  }
  res.send(myCards);
  logger.info(
    `status: ${res.statusCode} | Message: Cards have been sent successfully.`
  );
});

router.get("/:id", async (req, res) => {
  const card = await Card.findOne({ _id: req.params.id });
  if (!card) {
    res.status(400).send("No card found.");
    logger.error(`status: ${res.statusCode} | Message: No card found.`);
    return;
  }
  res.send(card);
  logger.info(
    `status: ${res.statusCode} | Message: Card have been sent successfully.`
  );
});

router.put("/:id", authMw, async (req, res) => {
  const { error } = cardUpdateValidation.validate(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    logger.error(
      `status: ${res.statusCode} | Message: ${error.details[0].message}`
    );
    return;
  }
  const card = await Card.findOne({ _id: req.params.id });
  if (!card) {
    res.status(400).send("No card found.");
    logger.error(`status: ${res.statusCode} | Message: No card found.`);
    return;
  }
  if (card.user_id.toString() === req.user._id) {
    res.status(400).send("Access denied.");
    logger.error(`status: ${res.statusCode} | Message: Access denied.`);
    return;
  }
  const updatedCard = await Card.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );
  res.send(updatedCard);
  logger.info(
    `status: ${res.statusCode} | Message: Card updated successfully.`
  );
});

router.patch("/:id", authMw, async (req, res) => {
  const card = await Card.findById({ _id: req.params.id });
  if (!card) {
    res.status(400).send("No card found.");
    logger.error(`status: ${res.statusCode} | Message: No card found.`);
    return;
  }
  if (card.likes.includes(req.user._id)) {
    const removeLike = await Card.findByIdAndUpdate(
      { _id: req.params.id },
      { $pull: { likes: req.user._id } },
      { new: true }
    );
    res.send(removeLike);
    logger.info(
      `status: ${res.statusCode} | Message: User like removed successfully.`
    );
    return;
  }
  const addLike = await Card.findByIdAndUpdate(
    { _id: req.params.id },
    { $push: { likes: req.user._id } },
    { new: true }
  );
  res.send(addLike);
  logger.info(
    `status: ${res.statusCode} | Message: User Like added successfully.`
  );
});

router.delete("/:id", authMw, async (req, res) => {
  try {
    let card = await Card.findById({ _id: req.params.id });
    if (!card) {
      res.status(400).send("No card found.");
      logger.error(`status: ${res.statusCode} | Message: No card found.`);
      return;
    }

    if (card.user_id.toString() !== req.user._id) {
      res.status(400).send("Access denied.");
      logger.error(`status: ${res.statusCode} | Message: Access denied.`);
      return;
    }
    card = await Card.findByIdAndDelete({ _id: req.params.id });
    res.send(card);
    logger.info(
      `status: ${res.statusCode} | Message: Card deleted successfully.`
    );
  } catch (err) {
    res.status(500).send("Something went wrong.");
    logger.error(`status: ${res.statusCode} | Message: Server Error.`);
  }
});

router.patch("/biz-number/:id", authMw, async (req, res) => {
  const { error } = bizNumberValidation.validate(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    logger.error(
      `status: ${res.statusCode} | Message: ${error.details[0].message}`
    );
    return;
  }

  if (!req.user.isAdmin) {
    res.status(400).send("Access denied.");
    logger.error(`status: ${res.statusCode} | Message: Access denied.`);
    return;
  }
  try {
    let card = await Card.findById({ _id: req.params.id });
    if (!card) {
      res.status(400).send("No card found.");
      logger.error(`status: ${res.statusCode} | Message: No card found.`);
      return;
    }
    card = await Card.findByIdAndUpdate(
      { _id: req.params.id },
      { $set: { bizNumber: req.body.bizNumber } },
      { new: true, runValidators: true }
    );
    res.send(card);
    logger.info(
      `status: ${res.statusCode} | Message: bizNumber changed successfully.`
    );
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const value = err.keyValue[field];
      res
        .status(400)
        .send(
          `The input field "${field}", with the value "${value}", already exist.`
        );
      logger.error(
        `status: ${res.statusCode} | Message: The input field "${field}", with the value "${value}", already exist.`
      );
      return;
    }
  }
});

module.exports = router;
