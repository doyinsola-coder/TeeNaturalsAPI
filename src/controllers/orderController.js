import Order from "../models/Order.js";
import axios from "axios";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import { baseTemplate } from "../utils/emailTemplate.js";

export const createOrder = async (req, res) => {
  try {
    const { orderItems, totalPrice } = req.body;

    if (orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      totalPrice,
    });

await sendEmail(
  req.user.email,
  "Order Created",
  baseTemplate(
    "Order Confirmed",
    "Your order has been successfully placed."
  )
);

    res.status(201).json(order);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Initialize Paystack payment
export const initializePayment = async (req, res) => {
  try {
    const { email, amount, orderId } = req.body;

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100, // Paystack uses kobo
        metadata: {
          orderId,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);

  } catch (error) {
    res.status(500).json({
      message: error.response?.data || error.message,
    });
  }
};

// Verify payment
export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = response.data.data;

    if (data.status === "success") {
      const order = await Order.findById(data.metadata.orderId).populate("user");

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: data.id,
        status: data.status,
        email: data.customer.email,
      };

      await order.save();

     await sendEmail(
  order.user.email,
  "Payment Successful",
  baseTemplate(
    "Payment Confirmed",
    "Your payment has been received successfully."
  )
);

      res.json({ message: "Payment verified and order updated" });

    } else {
      res.status(400).json({ message: "Payment not successful" });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const paystackWebhook = async (req, res) => {
  try {
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(req.body)
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(401).send("Invalid signature");
    }

    const event = JSON.parse(req.body.toString());

    // Only handle successful payment
    if (event.event === "charge.success") {
      const data = event.data;

      const order = await Order.findById(data.metadata.orderId).populate("user");

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: data.id,
        status: data.status,
        email: data.customer.email,
      };

      await order.save();

      // Send email
      try {
        await sendEmail(
          order.user.email,
          "Payment Successful",
          baseTemplate(
            "Payment Confirmed",
            "Your payment has been confirmed."
          )
        );
      } catch (err) {
        console.log("Email failed:", err.message);
      }
    }

    res.sendStatus(200);

  } catch (error) {
    console.error("Webhook error:", error.message);
    res.sendStatus(500);
  }
};