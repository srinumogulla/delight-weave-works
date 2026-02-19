// Auth
export interface SignupPayload {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
  date_of_birth?: string;
  time_of_birth?: string;
  birth_place_name?: string;
  gender?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface MobileSendCodePayload {
  phone: string;
}

export interface MobileVerifyPayload {
  phone: string;
  code: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user?: ApiUser;
}

// User
export interface ApiUser {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  avatar_url: string | null;
  date_of_birth: string | null;
  time_of_birth: string | null;
  birth_location: string | null;
  gender: string | null;
  gotra: string | null;
  nakshatra: string | null;
  rashi: string | null;
  created_at?: string;
  updated_at?: string;
}

// Pooja
export interface ApiPooja {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: string | null;
  category: string | null;
  ritual_type: string | null;
  temple: string | null;
  guru_name: string | null;
  image_url: string | null;
  benefits: string[] | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePoojaPayload {
  name: string;
  description?: string;
  price: number;
  duration?: string;
  category?: string;
  ritual_type?: string;
  temple?: string;
  guru_name?: string;
  benefits?: string[];
  scheduled_date?: string;
  scheduled_time?: string;
}

export interface UpdatePoojaPayload extends Partial<CreatePoojaPayload> {}

export interface SchedulePayload {
  scheduled_date: string;
  scheduled_time: string;
}

export interface LinkPayload {
  link: string;
}

// Guru
export interface ApiGuru {
  id: string;
  user_id: string | null;
  name: string;
  bio: string | null;
  photo_url: string | null;
  specializations: string[] | null;
  languages: string[] | null;
  experience_years: number | null;
  location: string | null;
  is_verified: boolean;
  is_active: boolean;
  approval_status: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateGuruPayload {
  name: string;
  bio?: string;
  specializations?: string[];
  languages?: string[];
  experience_years?: number;
  location?: string;
}

export interface GuruAnalytics {
  total_poojas: number;
  total_bookings: number;
  total_earnings: number;
  rating: number;
  [key: string]: any;
}

export interface GuruEarnings {
  total: number;
  pending: number;
  paid: number;
  history: Array<{
    date: string;
    amount: number;
    pooja_name: string;
    status: string;
  }>;
}

// Temple
export interface ApiTemple {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  deity: string | null;
  location: string | null;
  city: string | null;
  state: string | null;
  image_url: string | null;
  contact_phone: string | null;
  website_url: string | null;
  is_active: boolean;
  is_partner: boolean;
  approval_status: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TempleAnalytics {
  total_poojas: number;
  total_bookings: number;
  total_revenue: number;
  [key: string]: any;
}

// Gifts
export interface GiftOverview {
  total_gifts: number;
  occasions: string[];
  [key: string]: any;
}

export interface GiftOccasion {
  id: string;
  name: string;
  description?: string;
}

export interface PresignedUploadResponse {
  upload_url: string;
  file_url: string;
}

// Live Stream
export interface LiveStreamResponse {
  stream_id: string;
  channel_name: string;
  token: string;
  [key: string]: any;
}

export interface LiveStream {
  id: string;
  pooja_id: string;
  status: string;
  started_at: string;
  ended_at?: string;
}

// Notifications
export interface ApiNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface UnreadCountResponse {
  count: number;
}

// Transactions
export interface CreateTransactionPayload {
  pooja_id: string;
  amount: number;
  [key: string]: any;
}

export interface ApiTransaction {
  id: string;
  user_id: string;
  pooja_id: string;
  amount: number;
  status: string;
  created_at: string;
  [key: string]: any;
}

// Analytics
export interface TrackEventPayload {
  event_type: string;
  event_data?: Record<string, any>;
}

export interface AnalyticsEvent {
  id: string;
  event_type: string;
  event_data: Record<string, any>;
  created_at: string;
}

// Admin
export interface AdminAnalytics {
  total_users: number;
  total_bookings: number;
  total_revenue: number;
  total_temples: number;
  total_gurus: number;
  [key: string]: any;
}

export interface DoshaTag {
  id: string;
  name: string;
  description?: string;
}

export interface Mahavidya {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
}

export interface GiftTemplate {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  price?: number;
}

export interface PoojaRegistration {
  id: string;
  user_id: string;
  user_name: string;
  pooja_id: string;
  registered_at: string;
}
