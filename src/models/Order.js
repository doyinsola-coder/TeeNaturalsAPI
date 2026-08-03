import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderItems: [
      {
        name: String,
        qty: Number,
        image: String,
        price: Number,
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      },
    ],

    totalPrice: {
      type: Number,
      required: true,
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    paidAt: Date,

    paymentResult: {
      id: String,
      status: String,
      email: String,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,

    shippingAddress: {
      fullName: String,
      phone:    String,
      address:  String,
      city:     String,
      state:    String,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;