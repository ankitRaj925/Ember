export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'starter' | 'main' | 'dessert' | 'drink';
  image: string;
  calories?: number;
  isVegetarian?: boolean;
  isSpicy?: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface BookingRequest {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  specialRequests?: string;
}

export interface Booking extends BookingRequest {
  id: string;
  userEmail?: string;
  status: 'confirmed' | 'cancelled';
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export interface User {
  name: string;
  email: string;
  isAuthenticated: boolean;
  isAdmin?: boolean;
  password?: string; // Added for profile management
}

export interface Order {
  id: string;
  customerName: string;
  userEmail?: string; // Added to link orders to users
  items: CartItem[];
  total: number;
  status: 'received' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';
  address: string;
  timestamp: number;
}