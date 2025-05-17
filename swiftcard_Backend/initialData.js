require("dotenv").config();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const { User } = require("./model/user");
const { Card, generateBizNumber } = require("./model/card");
const { createSpinner } = require("nanospinner");

async function initialData() {
  const spinner = createSpinner("loading...").start();
  try {
    await mongoose.connect(process.env.MONGO_ATLAS_URI);
    spinner.success({ text: "Connected to DB" });
    // delete previous data
    await User.deleteMany({});
    await Card.deleteMany({});
    const createUsersSpinner = createSpinner("Creating new users").start();
    // creating the new users
    const admin = new User({
      name: {
        first: "admin",
        middle: "Man",
        last: "user",
      },
      phone: "0512345567",
      email: "admin@email.com",
      password: await bcrypt.hash("Abc!123Abc", 14),
      image: {
        url: "",
        alt: "",
      },
      address: {
        state: "IL",
        country: "Israel",
        city: "Arad",
        street: "Shoham",
        houseNumber: 5,
        zip: 8920435,
      },
      isBusiness: true,
      isAdmin: true,
    });

    const businessUser = new User({
      name: {
        first: "business",
        middle: "Man",
        last: "user",
      },
      phone: "0512345567",
      email: "business@email.com",
      password: await bcrypt.hash("Abc!123Abc", 14),
      image: {
        url: "",
        alt: "",
      },
      address: {
        state: "IL",
        country: "Israel",
        city: "Arad",
        street: "Shoham",
        houseNumber: 5,
        zip: 8920435,
      },
      isBusiness: true,
    });

    const user = new User({
      name: {
        first: "user",
        middle: "Man",
        last: "user",
      },
      phone: "0512345567",
      email: "user@email.com",
      password: await bcrypt.hash("Abc!123Abc", 14),
      image: {
        url: "",
        alt: "",
      },
      address: {
        state: "IL",
        country: "Israel",
        city: "Arad",
        street: "Shoham",
        houseNumber: 5,
        zip: 8920435,
      },
      isBusiness: false,
    });

    await admin.save();
    await businessUser.save();
    await user.save();
    createUsersSpinner.success({ text: "Users added successfully." });

    // creating the new Cards
    const createCardSpinner = createSpinner("Creating new cards").start();
    const businessUserResult = await businessUser.save();
    const card1 = new Card({
      title: "bingo!",
      subtitle: "a test value for this card",
      description: "a test value for new card\na test value for new card\n",
      phone: "0523271234",
      email: "first@gmail.com",
      web: "https://www.bing.com",
      image: {
        url: "",
        alt: "",
      },
      address: {
        state: "IL",
        country: "Israel",
        city: "Arad",
        street: "Shoham",
        houseNumber: 5,
        zip: 8920435,
      },
      user_id: businessUserResult._id,
      bizNumber: await generateBizNumber(),
    });
    const card2 = new Card({
      title: "wow wow wow!",
      subtitle: "a test value for this card",
      description: "a test value for new card\na test value for new card\n",
      phone: "0123211234",
      email: "sec@gmail.com",
      web: "https://www.amd.com",
      image: {
        url: "https://img.izismile.com/img/img13/20201030/640/you_have_never_seen_something_like_this_640_36.jpg",
        alt: "image of something",
      },
      address: {
        state: "IL",
        country: "Israel",
        city: "Arad",
        street: "Shoham",
        houseNumber: 5,
        zip: 8920435,
      },
      user_id: businessUserResult._id,
      bizNumber: await generateBizNumber(),
    });
    const card3 = new Card({
      title: "What a world",
      subtitle: "travel the world",
      description: "a test value for new card\na test value for new card\n",
      phone: "0589756213",
      email: "third@gmail.com",
      web: "https://www.google.com",
      image: {
        url: "https://img.izismile.com/img/img13/20201030/640/you_have_never_seen_something_like_this_640_36.jpg",
        alt: "image of something",
      },
      address: {
        state: "IL",
        country: "Israel",
        city: "Arad",
        street: "Shoham",
        houseNumber: 5,
        zip: 8920435,
      },
      user_id: businessUserResult._id,
      bizNumber: await generateBizNumber(),
    });

    await card1.save();
    await card2.save();
    await card3.save();

    createCardSpinner.success({ text: "Cards added successfully." });
    createCardSpinner.success({ text: "Done." });

    process.exit();
  } catch (err) {
    spinner.error({ text: "Error" + err.message });
    process.exit(1);
  }
}

initialData();
