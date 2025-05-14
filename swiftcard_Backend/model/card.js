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
    },
    alt: {
      type: String,
      maxlength: 1024,
      default: "Business image",
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
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  likes: {
    type: Array,
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

const Card = mongoose.model("Card", cardSchema, "cards");

const cardValidation = Joi.object({
  title: Joi.string().min(2).max(256).required().label("title"),
  subtitle: Joi.string().min(2).max(256).required().label("subtitle"),
  description: Joi.string().min(2).max(1024).required().label("description"),
  phone: Joi.string()
    .length(10)
    .pattern(/^0\d{9}$/)
    .required(),
  web: Joi.string()
    .uri({ scheme: ["http", "https"] }) // רק http/https
    .min(11)
    .max(1024)
    .allow("", null) // מאפשר ריק אם זה שדה לא חובה
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
      .default("Profile")
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
});

module.exports = {
  Card,
  cardValidation,
};
