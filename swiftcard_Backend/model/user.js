const mongoose = require("mongoose");
const Joi = require("joi");
const _ = require("lodash");
const userSchema = new mongoose.Schema({
  name: {
    first: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 255,
    },
    middle: {
      type: String,
      maxlength: 255,
      required: false,
      default: undefined,
    },
    last: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 255,
    },
  },
  phone: {
    type: String,
    minlength: 10,
    maxlength: 10,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    minlength: 6,
    maxlength: 255,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 1024,
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
      default: 0,
      required: true,
    },
  },
  image: {
    url: {
      type: String,
      maxlength: 1024,
      default: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
      set: (v) => (v === "" ? undefined : v),
    },
    alt: {
      type: String,
      maxlength: 1024,
      default: "Profile",
      set: (v) => (v === "" ? undefined : v),
    },
  },
  isBusiness: {
    type: Boolean,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  loginAttempts: {
    type: Number,
    required: true,
    default: 0,
  },
  lockUntil: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.__v;
    delete ret.password;
    delete loginAttempts;
    delete lockUntil;
    return ret;
  },
});

userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

const User = mongoose.model("User", userSchema, "users");

const Validation = {
  name: Joi.object({
    first: Joi.string().min(2).max(255).required().label("first name"),
    middle: Joi.string()
      .min(2)
      .max(255)
      .allow("")
      .optional()
      .label("middle name"),
    last: Joi.string().min(2).max(255).required().label("last name"),
  }).required(),

  phone: Joi.string()
    .length(10)
    .pattern(/^0\d{9}$/)
    .required(),

  email: Joi.string().email().min(6).max(255).required(),

  password: Joi.string().min(8).max(1024).required(),

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

  isBusiness: Joi.boolean().required(),

  isAdmin: Joi.boolean().default(false),
  loginAttempts: Joi.number().default(0),
  lockUntil: Joi.date(),
};

const userValidate = Joi.object(Validation).required();

const signInValidation = Joi.object(_.pick(Validation, ["email", "password"]));

const updateValidation = Joi.object(
  _.pick(Validation, ["name", "address", "image", "email", "phone"])
);

module.exports = {
  User,
  userValidate,
  signInValidation,
  updateValidation,
  userSchema,
};
