import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Stripe from 'stripe';
import User from '../models/User.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// -------------------- PLACE ORDER COD --------------------
export const placeOrderCOD = async (req, res) => {
    try {
        const { userId, address, items } = req.body;
        if (!address || !items || items.length === 0) {
            return res.json({ success: false, message: "Invalid data" });
        }

        let amount = 0;
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
            }
            amount += product.offerPrice * item.quantity;
        }

        amount += Math.floor(amount * 0.02); // Tax

        await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "COD",
            isPaid: false
        });

        return res.json({ success: true, message: "Order placed successfully!" });
    } catch (error) {
        console.error(error.message);
        return res.json({ success: false, message: error.message });
    }
};

// -------------------- PLACE ORDER STRIPE --------------------
export const placeOrderStripe = async (req, res) => {
    try {
        const { userId, address, items } = req.body;
        const { origin } = req.headers;

        if (!address || !items || items.length === 0) {
            return res.json({ success: false, message: "Invalid data" });
        }

        let productData = [];
        let amount = 0;

        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
            }
            amount += product.offerPrice * item.quantity;
            productData.push({
                name: product.name,
                price: product.offerPrice,
                quantity: item.quantity
            });
        }

        amount += Math.floor(amount * 0.02); // Tax

        const order = await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "Online",
            isPaid: false
        });

        const line_items = productData.map(item => ({
            price_data: {
                currency: "usd",
                product_data: { name: item.name },
                unit_amount: Math.floor(item.price + item.price * 0.02) * 100
            },
            quantity: item.quantity
        }));

        const session = await stripe.checkout.sessions.create({
            line_items,
            mode: "payment",
            success_url: `${origin}/loader?next=my-orders`,
            cancel_url: `${origin}/cart`,
            payment_intent_data: {
                metadata: { orderId: order._id.toString(), userId }
            }
        });

        return res.json({ success: true, url: session.url });
    } catch (error) {
        console.error(error.message);
        return res.json({ success: false, message: error.message });
    }
};

// -------------------- STRIPE WEBHOOK --------------------
export const stripeWebhooks = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        let orderId, userId;

        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            orderId = session.metadata.orderId;
            userId = session.metadata.userId;
        } else if (event.type === "payment_intent.succeeded") {
            const paymentIntent = event.data.object;
            orderId = paymentIntent.metadata?.orderId;
            userId = paymentIntent.metadata?.userId;
        } else {
            return res.status(200).json({ received: true });
        }

        if (!orderId || !userId) {
            console.error("Missing metadata for orderId or userId");
            return res.status(400).send("Missing metadata");
        }

        const updatedOrder = await Order.findByIdAndUpdate(orderId, { isPaid: true }, { new: true });
        if (!updatedOrder) {
            return res.status(404).send("Order not found");
        }

        await User.findByIdAndUpdate(userId, { cartItems: {} });

        return res.status(200).json({ received: true });
    } catch (err) {
        console.error("Error handling webhook:", err.message);
        return res.status(500).send("Internal server error");
    }
};

// -------------------- GET USER ORDERS --------------------
export const getUserOrders = async (req, res) => {
    try {
        const userId = req.userId;
        const orders = await Order.find({ userId }).populate("items.product address").sort({ createdAt: -1 });
        return res.json({ success: true, orders });
    } catch (error) {
        console.error(error.message);
        return res.json({ success: false, message: error.message });
    }
};

// -------------------- GET ALL ORDERS --------------------
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate("items.product address").sort({ createdAt: -1 });
        return res.json({ success: true, orders });
    } catch (error) {
        console.error(error.message);
        return res.json({ success: false, message: error.message });
    }
};
