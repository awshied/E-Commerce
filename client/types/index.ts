import { NewsContent, PopulatedUser, UserGender, UserRole } from "@/lib/type";

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
  _id: string;
  label: "rumah" | "apartemen" | "hotel" | "kantor";
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

export interface User {
  _id: string;
  username: string;
  email: string;
  birthday?: string;
  role: UserRole;
  gender: UserGender;
  imageUrl: string;
  addresses: Address[];
  wishlist: string[];
  newsReads: number;
  newsLikes: string[];
  newsDislikes: string[];
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

export interface NewsImage {
  url: string;
  public_id: string;
}

export interface NewsActivities {
  totalLikes: number;
  totalDislikes: number;
  totalComments: number;
  totalViews: number;
  totalParentComments: number;
}

export interface News {
  _id: string;
  title: string;
  slug: string;
  caption: string;
  newsImages: NewsImage[];
  content: NewsContent;
  tags: string[];
  userId: string | User;
  activity: NewsActivities[];
  comments: string[];
  draft: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommentActivity {
  totalLikes: number;
  totalDislikes: number;
  likedBy: string[];
  dislikedBy: string[];
}

export interface Comment {
  _id: string;
  newsId: string;
  userId: string | User;
  comment: string;
  children: Comment[];
  isReply: boolean;
  parent: string | null;
  isHidden: boolean;
  activity: CommentActivity;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = unknown> {
  message: string;
  data?: T;
  news?: News | News[];
  comment?: Comment;
  comments?: Comment[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateCommentRequest {
  newsId: string;
  comment: string;
  parentId?: string | null;
}

export interface ReactToNewsRequest {
  type: "like" | "dislike";
}

export interface ReactToCommentRequest {
  type: "like" | "dislike";
}

export interface UpdateCommentRequest {
  comment: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface NewsQueryParams extends PaginationParams {
  tag?: string;
}

export interface CommentQueryParams {
  newsId: string;
}

export interface RepliesResponse {
  replies: Comment[];
}

export interface NewsListScreenProps {
  news: News[];
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onNewsPress: (newsId: string) => void;
  onLoadMore?: () => void;
}

export interface NewsDetailScreenProps {
  newsId: string;
  news?: News | null;
  comments?: Comment[];
  isLoading: boolean;
  isSubmitting?: boolean;
  onReactToNews: (type: "like" | "dislike") => void;
  onCreateComment: (comment: string, parentId?: string | null) => void;
  onReactToComment: (commentId: string, type: "like" | "dislike") => void;
}

export interface CommentItemProps {
  comment: Comment;
  level?: number;
  currentUserId?: string;
  isSubmitting?: boolean;
  onReply: (comment: Comment) => void;
  onLike: (commentId: string) => void;
  onDislike: (commentId: string) => void;
}

export interface PopulatedComment extends Omit<Comment, "userId" | "children"> {
  userId: PopulatedUser;
  children: PopulatedComment[];
}

export interface PopulatedNews extends Omit<News, "userId" | "comments"> {
  userId: PopulatedUser;
  comments: PopulatedComment[];
}
