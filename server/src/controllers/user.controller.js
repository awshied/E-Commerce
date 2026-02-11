import { User } from "../models/user.model.js";

// Membuat atau Menambahkan Alamat Baru
export const addAddress = async (req, res) => {
  try {
    const {
      fullName,
      streetAddress,
      village,
      district,
      city,
      zipCode,
      province,
      phoneNumber,
      isDefault,
    } = req.body;

    const user = req.user;

    if (
      !fullName ||
      !streetAddress ||
      !village ||
      !district ||
      !city ||
      !zipCode ||
      !province
    ) {
      return res
        .status(400)
        .json({ error: "Ada field alamat yang masih kosong." });
    }

    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push({
      fullName,
      streetAddress,
      village,
      district,
      city,
      zipCode,
      province,
      phoneNumber,
      isDefault: isDefault || false,
    });

    await user.save();

    res.status(200).json({
      message: "Alamat telah ditambahkan.",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error di controller addAddress:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Menangkap Semua Alamat Yang Telah Dibuat
export const getAddress = async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({ addresses: user.addresses });
  } catch (error) {
    console.error("Error di controller getAddress:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Memperbarui Alamat
export const updateAddress = async (req, res) => {
  try {
    const {
      fullName,
      streetAddress,
      village,
      district,
      city,
      zipCode,
      province,
      phoneNumber,
      isDefault,
    } = req.body;

    const { addressId } = req.params;
    const user = req.user;

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ error: "Alamat tidak ditemukan." });
    }

    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    address.fullName = fullName || address.fullName;
    address.streetAddress = streetAddress || address.streetAddress;
    address.village = village || address.village;
    address.district = district || address.district;
    address.city = city || address.city;
    address.zipCode = zipCode || address.zipCode;
    address.province = province || address.province;
    address.phoneNumber = phoneNumber || address.phoneNumber;
    address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

    await user.save();

    res
      .status(200)
      .json({ message: "Alamat telah diperbarui.", addresses: user.addresses });
  } catch (error) {
    console.error("Error di controller updateAddress:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Menghapus Alamat
export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = req.user;

    user.addresses.pull(addressId);
    await user.save();

    res
      .status(200)
      .json({ message: "Alamat berhasil dihapus.", addresses: user.addresses });
  } catch (error) {
    console.error("Error di controller deleteAddress:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Menambahkan Produk Sebagai Favorit
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ error: "Produk sudah ada di favorit." });
    }

    user.wishlist.push(productId);
    await user.save();

    res.status(200).json({
      message: "Produk telah ditambahkan sebagai favorit.",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Error di controller addToWishlist:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Menangkap Semua Produk Yang Menjadi Favorit Pengguna
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");
    if (!user) {
      return res.status(404).json({ error: "User tidak ditemukan." });
    }

    res.status(200).json({ wishlist: user.wishlist });
  } catch (error) {
    console.error("Error di controller getWishlist:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Membuat Produk Dari Favorit
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = req.user;

    if (!user.wishlist.includes(productId)) {
      return res
        .status(400)
        .json({ error: "Produk tidak ditemukan dalam favorit." });
    }

    user.wishlist.pull(productId);
    await user.save();

    res.status(200).json({ message: "Produk telah dihapus dari favorit." });
  } catch (error) {
    console.error("Error di controller removeFromWishlist:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

export const pingUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user.lastActive = new Date();
    await req.user.save();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error di controller pingUser:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};
