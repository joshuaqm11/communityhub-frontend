export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: string | null;
  role: 'admin' | 'organizer' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
}

export interface EventItem {
  _id: string;
  title: string;
  description: string;
  category: Category | string | null;
  date: string;
  time: string;
  location: string;
  capacity: number;
  registeredCount: number;
  image: string | null;
  organizer: User | string;
  status: 'active' | 'cancelled' | 'finished';
  createdAt: string;
  updatedAt: string;
}

export interface Registration {
  _id: string;
  user: string | User;
  event: EventItem;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface Favorite {
  _id: string;
  user: string;
  event: EventItem;
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  user: string;
  event?: { _id: string; title: string; date: string } | null;
  message: string;
  type: 'reminder' | 'update' | 'system';
  read: boolean;
  createdAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}
