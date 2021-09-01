const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  name: String,
  description: String,
  price: Number,
  user_id: String,
  created_at: {
    type: Date,
    default: Date.now(),
  },
});

const Product = mongoose.model("product", ProductSchema);
module.exports = Product;
