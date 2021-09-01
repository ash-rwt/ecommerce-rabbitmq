const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const amqp = require("amqplib");

const Product = require("./Product");

const PORT = process.env.PORT || 7101;
const SECRET_KEY = process.env.SECRET_KEY || "secret";
const authenticate = require("./authenticate");

const app = express();
app.use(express.json());

// Mongo DB connect URL
const MONGO_URI = process.env.MONGO_URI;
const AMPQ_URL = "amqp://rabbitmq:5672";

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
        console.info(`Mongo DB running for Product-Service`);
      }
    );
  } catch (err) {
    console.error("Failed to connect Product-Service DB", err);
  }
};

connectDB();

let channel, connections;
async function connect() {
  connection = await amqp.connect(AMPQ_URL);
  channel = await connection.createChannel();
  await channel.assertQueue("PRODUCT");
}

connect();

//Create a new product
// Buy a product

app.post("/product/create", authenticate, async (req, res) => {
  // authenticated user_only = req.user.email
  const { name, description, price } = req.body;
  const newProduct = new Product({
    name,
    description,
    user_id: req.user.id,
    price,
  });
  newProduct.save();
  return res.json(newProduct);
});

// Users sends a list of products to buy
// Creating an order with those products and total amount

app.post("/product/buy", authenticate, async (req, res) => {
  const { ids } = req.body;
  const products = await Product.find({ _id: { $in: ids } });
  channel.sendToQueue(
    "Order",
    Buffer.from(
      JSON.stringify({
        products,
        userId: req.user.id,
        userEmail: req.user.email,
      })
    )
  );
});

app.listen(PORT, () => {
  console.info(`Product Service server running on port ${PORT}`);
});
