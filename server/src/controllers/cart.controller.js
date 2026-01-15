import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";

export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product"
    );

    if (!cart) {
      const user = req.user;

      cart = await Cart.create({
        user: user._id,
        items: [],
      });
    }

    res.status(200).json({ cart });
  } catch (error) {
    console.error("Error di controller getCart", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Produk tidak ditemukan." });
    }

    if (product.stock < quantity) {
      return res.status(404).json({ error: "Stok sudah habis." });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      const user = req.user;
      cart = await Cart.create({
        user: user._id,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );
    if (existingItem) {
      const newQuantity = existingItem.quantity + 1;
      if (product.stock < newQuantity) {
        res.status(400).json({ error: "Stok sudah habis." });
      }
      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();

    res
      .status(200)
      .json({ message: "Produk telah ditambahkan ke dalam keranjang.", cart });
  } catch (error) {
    console.error("Error di controller addToCart", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ error: "Minimal harus ada 1 kuantitas." });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ error: "Keranjang tidak ditemukan." });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );
    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ error: "Produk tidak tersedia di dalam keranjang." });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Produk tidak ditemukan." });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: "Stok sudah habis." });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    res.status(200).json({ message: "Keranjang berhasil diperbarui.", cart });
  } catch (error) {
    console.error("Error di controller updateCartItem:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ error: "Keranjang tidak ditemukan." });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );
    await cart.save();

    res.status(200).json({ message: "Produk telah dibuang dari keranjang." });
  } catch (error) {
    console.error("Error di controller removeFromCart:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ error: "Keranjang tidak ditemukan." });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({ message: "Keranjang telah dibersihkan.", cart });
  } catch (error) {
    console.error("Error di controller clearCart:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};
