export type CategoryName =
  | 'Rice & Grains'
  | 'Dals'
  | 'Oils'
  | 'Snacks'
  | 'Beverages'
  | 'Dairy'
  | 'Fruits & Vegetables'
  | 'Personal Care'
  | 'Household';

export interface Category {
  id: string;
  name: CategoryName;
  slug: string;
  icon: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  category: CategoryName;
  description: string;
  price: number;
  mrp: number;
  discount: number;
  unit: string;
  stock: number;
  image: string;
  featured: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Address {
  name: string;
  phone: string;
  addressLine: string;
  area: string;
  city: string;
  pincode: string;
  landmark?: string;
  deliveryInstructions?: string;
}

export type OrderStatus =
  | 'Placed'
  | 'Confirmed'
  | 'Preparing'
  | 'Ready'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export type PaymentMethod = 'Cash on Delivery' | 'UPI / Online Payment';

export interface OrderItem {
  productId: string;
  productName: string;
  unit: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  address: Address;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
}
