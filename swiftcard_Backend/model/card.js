const mongoose = require("mongoose");
const _ = require("lodash");
const Joi = require("joi");

const cardSchema = new mongoose.Schema({
  title: {
    type: String,
    minlength: 2,
    maxlength: 256,
    required: true,
  },
  subtitle: {
    type: String,
    minlength: 2,
    maxlength: 256,
    required: true,
  },
  description: {
    type: String,
    minlength: 2,
    maxlength: 1024,
    required: true,
  },
  phone: {
    type: String,
    minlength: 10,
    maxlength: 10,
    required: true,
  },
  email: {
    type: String,
    minlength: 5,
    required: true,
    unique: true,
  },
  web: {
    type: String,
    minlength: 14,
  },
  image: {
    url: {
      type: String,
      maxlength: 1024,
      default: "https://www.wearegecko.co.uk/media/50316/mountain-3.jpg",
      set: (v) => (v === "" ? undefined : v),
    },
    alt: {
      type: String,
      maxlength: 1024,
      default: "Business image",
      set: (v) => (v === "" ? undefined : v),
    },
  },
  address: {
    state: {
      type: String,
      maxlength: 255,
      required: false,
      default: undefined,
    },
    country: {
      type: String,
      minlength: 2,
      maxlength: 255,
      required: true,
    },
    city: {
      type: String,
      minlength: 2,
      maxlength: 255,
      required: true,
    },
    street: {
      type: String,
      minlength: 2,
      maxlength: 255,
      required: true,
    },
    houseNumber: {
      type: Number,
      min: 1,
      max: 99999,
      required: true,
    },
    zip: {
      type: Number,
      min: 1,
      max: 9999999,
      required: true,
      default: 0,
    },
  },
  bizNumber: {
    type: Number,
    min: 100,
    max: 999_999_999,
    required: true,
    unique: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  likes: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
    default: [],
  },
});

cardSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const generateBizNumber = async () => {
  while (true) {
    const number = _.random(100, 999_999_999);
    const isExist = await Card.findOne({ bizNumber: number });
    if (!isExist) {
      return number;
    }
  }
};

const Card = mongoose.model("Card", cardSchema, "cards");

const Validation = {
  title: Joi.string().min(2).max(256).required().label("title"),
  subtitle: Joi.string().min(2).max(256).required().label("subtitle"),
  description: Joi.string().min(2).max(1024).required().label("description"),
  phone: Joi.string()
    .length(10)
    .pattern(/^0\d{9}$/)
    .required(),
  web: Joi.string()
    .uri({ scheme: ["http", "https"] })
    .min(14)
    .max(1024)
    .allow("", null)
    .label("Website"),
  email: Joi.string().email().min(6).max(255).required(),
  image: Joi.object({
    url: Joi.string()
      .uri({ scheme: [/https?/] })
      .min(11)
      .max(1024)
      .default("https://cdn-icons-png.flaticon.com/512/3135/3135715.png")
      .allow("")
      .label("URL"),
    alt: Joi.string()
      .min(2)
      .max(1024)
      .default("Business Image")
      .allow("")
      .label("Alt image"),
  }).optional(),
  address: Joi.object({
    state: Joi.string()
      .min(2)
      .max(255)
      .allow("")
      .optional()
      .default("not defined")
      .label("state"),
    country: Joi.string().min(2).max(255).required().label("country"),
    city: Joi.string().min(2).max(255).required().label("city"),
    street: Joi.string().min(2).max(255).required().label("street"),
    houseNumber: Joi.number().min(1).max(99999).required().label("houseNumber"),
    zip: Joi.number().min(1).max(9999999).required().label("zip"),
  }).required(),
  bizNumber: Joi.number().min(100).max(999_999_999),
};

const cardUpdateValidation = Joi.object(
  _.pick(Validation, [
    "title",
    "subtitle",
    "description",
    "phone",
    "web",
    "email",
    "image",
    "address",
  ])
);
const cardValidation = Joi.object(Validation).required();

const bizNumberValidation = Joi.object(_.pick(Validation, ["bizNumber"]));

module.exports = {
  Card,
  cardValidation,
  generateBizNumber,
  cardUpdateValidation,
  bizNumberValidation,
};
