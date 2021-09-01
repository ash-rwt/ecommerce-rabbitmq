const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("./User");

const PORT = process.env.PORT || 7100;
const SECRET_KEY = process.env.SECRET_KEY || "secret";

const app = express();
app.use(express.json());

// Mongo DB connect URL
const MONGO_URI = process.env.MONGO_URI;

//Connecting to mongo DB
const connectDB = async () => {
  try {
    await mongoose.connect(
      MONGO_URI,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
      },
      () => {
        console.info(`Mongo DB running for Auth-Service`);
      }
    );
  } catch (err) {
    console.error("Failed to connect mongo DB", err);
  }
};

connectDB();

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });
  // Check if user exists
  if (!user) {
    return res.json({ message: "User Not found" });
  }
  // Check if entered password is correct
  if (password != user.password) {
    return res.json({ message: "Password is incorrect!" });
  }

  const payload = {
    id: user._id,
    email,
  };

  jwt.sign(payload, SECRET_KEY, (err, token) => {
    if (err) {
      console.error(err);
    } else {
      return res.json({ token });
    }
  });
});

app.post("/auth/register", async (req, res, next) => {
  const { name, email, password } = req.body;
  const user = await User.findOne({ email: email });
  if (user) {
    return res.json({ message: "User does not exists" });
  }
  const newUser = User({
    name,
    email,
    password,
  });
  newUser.save();

  return res.json(newUser);
});

app.listen(PORT, () => {
  console.info(`Auth Service server running on port ${PORT}`);
});
