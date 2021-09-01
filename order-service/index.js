const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const amqp = require("amqplib");

const Order = require("./Order");

const PORT = process.env.PORT || 7102;
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
        console.info(`Mongo DB running for Order-Service`);
      }
    );
  } catch (err) {
    console.error("Failed to connect Order Service DB", err);
  }
};

connectDB();

let channel, connections;
async function connect() {
  connection = await amqp.connect(AMPQ_URL);
  channel = await connection.createChannel();
  await channel.assertQueue("Order");
}

connect().then(() => {
  channel.consume("ORDER", (data) => {
    const { products, userId, userEmail } = JSON.parse(data.content);
    console.log(`Consuming ORDER queue`);
    console.log(products);
  });
});

app.listen(PORT, () => {
  console.info(`Order Service server running on port ${PORT}`);
});
