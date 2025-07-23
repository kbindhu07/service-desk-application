const functions = require("firebase-functions");
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: "YOUR_KEY_ID",
  key_secret: "YOUR_KEY_SECRET",
});

exports.createRazorpayOrder = functions.https.onRequest(async (req, res) => {
  try {
    const amount = req.query.amount; // amount in paise (e.g. 50000 for ₹500)
    const options = {
      amount: Number(amount),
      currency: "INR",
      receipt: "receipt#" + Date.now(),
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
