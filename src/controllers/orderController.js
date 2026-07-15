import Order from "../models/Order.js";
import axios from "axios";
// import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import { baseTemplate } from "../utils/emailTemplate.js";

// 1. Create standard unpaid order
export const createOrder = async (req, res) => {
  try {
    const { orderItems, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    // Map your items safely to match schema attributes
    const configuredItems = orderItems.map(item => ({
      name: item.name,
      qty: item.quantity || item.qty, // Safeguard for frontend naming differences
      image: item.image,
      price: item.price,
      product: item.product || item._id
    }));

    const order = await Order.create({
      user: req.user._id,
      orderItems: configuredItems,
      totalPrice,
    });

    // Optional: Send initial processing email
    // try {
    //   await sendEmail(
    //     req.user.email,
    //     "Order Created",
    //     baseTemplate("Order Confirmed", "Your order has been successfully placed. Proceed to payment.")
    //   );
    // } catch (e) {
    //   console.error("Order creation email failed to send:", e.message);
    // }

    return res.status(201).json(order);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 2. Initialize Paystack Payment Gateway Interaction
export const initializePayment = async (req, res) => {
  try {
    const { email, amount, orderId } = req.body;

    if (!email || !amount || !orderId) {
      return res.status(400).json({ message: "Missing required checkout fields." });
    }

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: Math.round(amount * 100), // Converted to kobo securely
        metadata: {
          orderId: orderId.toString(), // Force cast to string for schema compatibility
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.json(response.data);
  } catch (error) {
    return res.status(500).json({
      message: error.response?.data?.message || error.message,
    });
  }
};

// 3. User Redirect Hook Verification Endpoint (Synchronous Callback Check)
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

      // Safe processing fallback if webhook hasn't processed it yet
      if (!order.isPaid) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.status = "processing"; // 🚀 FIX: Update order status to processing
        order.paymentResult = {
          id: data.id,
          status: data.status,
          email: data.customer.email,
        };
        await order.save();

        // try {
        //   await sendEmail(
        //     order.user.email,
        //     "Payment Successful",
        //     baseTemplate("Payment Confirmed", "Your payment has been received successfully.")
        //   );
        // } catch (emErr) {
        //   console.error("Verification email failed:", emErr.message);
        // }
      }

      return res.json({ message: "Payment verified and order updated", order });
    } else {
      return res.status(400).json({ message: "Payment not successful" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 4. Automated Secure Webhook Event Handler (Asynchronous Payload processing)
export const paystackWebhook = async (req, res) => {
  try {
    // Generate validation hash from raw buffer string stream
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(req.body) 
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      console.error("❌ Invalid Webhook Signature Rejected!");
      return res.status(401).send("Invalid signature");
    }

    const event = JSON.parse(req.body.toString());

    if (event.event === "charge.success") {
      const data = event.data;

      console.log("📦 Received Webhook Metadata Order ID:", data.metadata?.orderId);

      if (!data.metadata || !data.metadata.orderId) {
        return res.status(400).send("No Order ID provided in metadata.");
      }

      const order = await Order.findById(data.metadata.orderId).populate("user");
      console.log("🔍 Database Order matching webhook found?:", order ? "YES" : "NO");

      if (!order) {
        return res.status(404).send("Order not found");
      }

      // IDEMPOTENCY CHECK: If already updated by verifyPayment endpoint, gracefully stop here
      if (order.isPaid) {
        console.log(`ℹ️ Order ${order._id} was already marked as paid.`);
        return res.sendStatus(200);
      }

      order.isPaid = true;
      order.paidAt = Date.now();
      order.status = "processing";
      order.paymentResult = {
        id: data.id,
        status: data.status,
        email: data.customer.email,
      };

      await order.save();
      console.log(`✅ Order ${order._id} successfully marked as PAID via Webhook.`);

      try {
        // await sendEmail(
        //   order.user.email,
        //   "Payment Successful",
        //   baseTemplate("Payment Confirmed", "Your payment has been confirmed.")
        // );
      } catch (err) {
        console.error("Email failed:", err.message);
      }
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error("💥 Webhook internal error:", error.message);
    return res.sendStatus(500);
  }
};

// 5. Get customer personal records
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 6. Delete unpaid record
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id); 
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.isPaid) {
      return res.status(400).json({ message: "Cannot delete a paid order" });
    }
    await Order.findByIdAndDelete(req.params.id);
    return res.json({ message: "Order deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
