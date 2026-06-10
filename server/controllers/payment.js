import User from '../models/user.js'
import Payment from '../models/payment.js'
import razorpay from '../services/razorpay.js'
import crypto from 'crypto'

export const createOrder = async (req, res) => {
  try {
    const { planId, amount, credits } = req.body;

    // Validate input
    if (!amount || !credits) {
      return res.status(400).json({ message: "Invalid plan data" });
    }

    // Razorpay order options
    const options = {
      amount: amount * 100, // convert to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    // Create order in Razorpay
    const order = await razorpay.orders.create(options);

    // Save payment record in MongoDB
    await Payment.create({
      userId: req.userId, 
      planId,
      amount,
      credits,
      razorpayOrderId: order.id,
      status: "created",
    });

    // Return order details to frontend
    return res.json(order);

  } catch (error) {
    return res.status(500).json({
      message: `Failed to create Razorpay order: ${error.message}`,
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Generate signature body
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    // Create expected signature using Razorpay secret
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(body)
      .digest("hex");

    // Compare signatures
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Find payment record
    const payment = await Payment.findOne({
        razorpayOrderId: razorpay_order_id,
    });

    if(!payment) {
        return res.status(404).json({message: "Payment not found"})
    }

    if(payment.status === "paid") {
        return res.json({message: "Already processed"});
    }

    // Update payment record
    payment.status = "paid";
    payment.razorpayPaymentId = razorpay_payment_id;
    await payment.save()

    // Add credits to user
    const updatedUser = await User.findByIdAndUpdate(payment.userId, {
        $inc: {credits: payment.credits}
    }, {returnDocument: 'after'})

    return res.json({
        success: true,
        message: "Payment verified and credits added",
        user: updatedUser
    })

  } catch (error) {
    return res.status(500).json({
      message: `Failed to verify payment: ${error.message}`,
    });
  }
};


