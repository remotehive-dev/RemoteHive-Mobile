export interface Job {
  id: string;
  title: string;
  company_name: string;
  company_logo_url?: string;
  company_id?: string;
  location: string;
  workplace_type?: 'remote' | 'hybrid' | 'onsite';
  location_lat?: number;
  location_lng?: number;
  location_place_id?: string;
  type: string;
  salary_range?: string;
  posted_at: string;
  tags: string[];
  application_url?: string;
  description?: string;
  requirements?: string[];
  benefits?: string[];
  screening_questions?: string[];
  requires_immediate_joiner?: boolean;
  shift_timing?: string;
  job_reference_id?: string;
  application_method?: 'external' | 'internal';
  match_score?: number;
  company?: Company;
}

export interface Company {
  id: string;
  name: string;
  logo_url?: string;
  website_url?: string;
  description?: string;
  location?: string;
  tags?: string[];
  rating?: number;
  review_count?: number;
  size?: string;
  founded?: string;
  industry?: string;
  type?: string;
  company_type?: string;
  remote_style?: string;
  core_hours?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon_url?: string;
  job_count?: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  images: string[];
  category?: string;
  tags?: string[];
  rating?: number;
  review_count?: number;
  in_stock?: boolean;
  features?: string[];
}

export interface Campaign {
  id: string;
  user_id: string;
  title: string;
  target_role: string;
  target_location?: string;
  keywords?: string[];
  min_salary?: number;
  max_applications: number;
  applications_sent: number;
  status: 'active' | 'paused' | 'completed';
  created_at: string;
  updated_at?: string;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  role: string;
  thumbnail_url?: string;
  duration?: string;
  lessons_count?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  rating?: number;
  enrolled_count?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface UserProfile {
  clerk_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  role: 'employer' | 'jobseeker';
  headline?: string;
  bio?: string;
  skills?: string[];
  experience_level?: string;
  resume_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  phone?: string;
  city?: string;
  country?: string;
  company_id?: string;
}
