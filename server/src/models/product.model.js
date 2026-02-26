import mongoose from "mongoose";

const sizeSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
});

const promoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  discountPercent: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Campuran", "Pria", "Wanita", "Anak-anak"],
      default: "Campuran",
      required: true,
    },
    sizes: [sizeSchema],
    images: [
      {
        url: String,
        public_id: String,
      },
    ],
    newUntil: {
      type: Date,
    },
    promo: promoSchema,
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

promoSchema.pre("validate", function (next) {
  if (this.endDate < this.startDate) {
    next(new Error("End date must be after start date"));
  } else {
    next();
  }
});

productSchema.pre("save", function (next) {
  if (!this.newUntil) {
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    this.newUntil = new Date(Date.now() + sevenDays);
  }
  next();
});

export const Product = mongoose.model("Product", productSchema);
