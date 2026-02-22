export interface Size {
  size: string;
  price: number;
  stock: number;
}

export interface Promo {
  title: string;
  discountPercent: number;
  startDate?: Date;
  endDate?: Date;
}

export interface Image {
  url: string;
  public_id: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  type: string;
  gender: "Campuran" | "Pria" | "Wanita" | "Anak-anak";
  sizes: Size[];
  images: Image[];
  newUntil?: Date;
  promo?: Promo | null;
  averageRating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilter {
  category?: string;
  type?: string;
  gender?: "Campuran" | "Pria" | "Wanita" | "Anak-anak";
  minPrice?: number;
  maxPrice?: number;
  promoRange?: {
    min: number;
    max: number;
  };
}

export interface Address {
  _id?: string;
  fullName: string;
  streetAddress: string;
  village: string;
  district: string;
  city: string;
  zipCode: string;
  province: string;
  phoneNumber: string;
  isDefault: boolean;
}

export type UserRole = "user" | "admin";

export interface User {
  _id: string;
  username: string;
  email: string;
  role: UserRole;
  imageUrl: string;
  addresses: Address[];
  wishlist: string[];
  lastActive: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  _id: string;
  product: Product;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
}

export interface Order {
  _id: string;
  user: string;
  orderItems: OrderItem[];
  shippingAddress: {
    fullName: string;
    streetAddress: string;
    village: string;
    district: string;
    city: string;
    zipCode: string;
    province: string;
    phoneNumber: string;
  };
  paymentResult: {
    id: string;
    status: string;
  };
  totalPrice: number;
  status: "dikemas" | "dikirim" | "diterima";
  hasReviewed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  productId: string;
  userId: string | User;
  orderId: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  _id: string;
  product: Product;
  size: string;
  quantity: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  _id: string;
  title: string;
  amount: number;
  expenseCategory:
    | "Operasional"
    | "Air"
    | "Gaji Karyawan"
    | "Listrik"
    | "Lainnya";
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reaction {
  _id: string;
  userId: string;
  type: string;
}

export interface Reply {
  _id: string;
  userId: string;
  message: string;
  createdAt: string;
}

export interface Comment {
  _id: string;
  productId: string;
  userId: string | User;
  comment: string;
  reactions: Reaction[];
  replies: Reply[];
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
}
