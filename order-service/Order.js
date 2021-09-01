const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  products: [
    {
      product_id: String,
    },
  ],
  user_id: String,
  user_emai: String,
  total_value: Number,
  created_at: {
    type: Date,
    default: Date.now(),
  },
});

const Order = mongoose.model("order", OrderSchema);
module.exports = Order;
