import Stripe from "stripe";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { Cart } from "../models/cart.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function createPayment(req, res) {
  try {
    const { cartItems, shippingAddress } = req.body;
    const user = req.user;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: "Keranjang masih kosong." });
    }

    let subtotal = 0;
    const validatedItems = [];

    for (const item of cartItems) {
      const product = await Product.findById(item.product._id);
      if (!product) {
        return res
          .status(404)
          .json({ error: `${item.product.name} tidak ditemukan.` });
      }

      const sizeItem = product.sizes.find((s) => s.size === item.size);

      if (!sizeItem) {
        return res.status(400).json({ error: "Ukuran tidak valid." });
      }

      if (sizeItem.stock < item.quantity) {
        return res.status(400).json({
          error: `Stok ${product.name} ukuran ${item.size} tidak cukup.`,
        });
      }

      subtotal += sizeItem.price * item.quantity;
      validatedItems.push({
        product: product._id.toString(),
        name: product.name,
        price: sizeItem.price,
        quantity: item.quantity,
        image: product.images[0]?.url,
      });
    }

    const shipping = 8000;
    const tax = subtotal * 0.4;
    const total = subtotal + shipping + tax;

    if (total <= 0) {
      return res.status(400).json({ error: "Pesanan tidak valid." });
    }

    let customer;
    if (user.stripeCustomerId) {
      customer = await stripe.customers.retrieve(user.stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        name: user.username,
        email: user.email,
        metadata: {
          userId: user._id.toString(),
        },
      });

      await User.findByIdAndUpdate(user._id, { stripeCustomerId: customer.id });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: "idr",
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: user.email,
      description: `Dipesan oleh ${user.username}`,
      metadata: {
        userId: user._id.toString(),
        orderItems: JSON.stringify(validatedItems),
        shippingAddress: JSON.stringify(shippingAddress),
        totalPrice: total.toString(),
      },
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error di controller createPayment:", error);
    res.status(500).json({ message: "Server internal error." });
  }
}
