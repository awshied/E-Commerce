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

    if (
      !shippingAddress ||
      !shippingAddress.streetAddress ||
      !shippingAddress.city
    ) {
      return res
        .status(400)
        .json({ error: "Alamat pengiriman tidak lengkap." });
    }

    let subtotal = 0;
    const validatedItems = [];

    for (const item of cartItems) {
      if (!item.product || !item.product._id) {
        return res.status(400).json({ error: "Item keranjang tidak valid." });
      }

      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        return res.status(400).json({ error: "Jumlah item tidak valid." });
      }

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

      let price = sizeItem.price;

      if (product.promo) {
        const now = new Date();
        const isActive =
          new Date(product.promo.startDate) <= now &&
          now <= new Date(product.promo.endDate);

        if (isActive) {
          const discount = product.promo.discountPercent || 0;
          price = Math.round(price - price * (discount / 100));
        }
      }

      subtotal += price * item.quantity;
      validatedItems.push({
        product: product._id.toString(),
        name: product.name,
        size: item.size,
        price,
        quantity: item.quantity,
        image: product.images[0]?.url,
      });
    }

    const shipping = 8000;
    const tax = Math.round(subtotal * 0.04);
    const total = Math.round(subtotal + shipping + tax);

    const minimalAmount = 8000;

    if (total < minimalAmount) {
      return res.status(400).json({
        error: `Minimum transaksi seharusnya Rp${minimalAmount.toLocaleString("id-ID")}`,
      });
    }

    let customer;
    if (user.stripeCustomerId) {
      try {
        customer = await stripe.customers.retrieve(user.stripeCustomerId);
        if (customer.deleted) {
          customer = null;
        }
      } catch (err) {
        customer = null;
      }
    }
    if (!customer) {
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
        itemCount: validatedItems.length.toString(),
        productIds: validatedItems.map((i) => i.product).join(","),
        totalPrice: total.toString(),
      },
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error di controller createPayment:", error);
    res.status(500).json({ message: "Server internal error." });
  }
}
