export interface ProductSize {
  size: string;
  stock: number;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  types: string;
  sizes: ProductSize[];
  images: string[];
  averageRating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
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
