import { getSupabase } from "./supabase";
import { Job, UserProfile } from "../types";
import Constants from 'expo-constants';

const DJANGO_API_URL = Constants.expoConfig?.extra?.djangoApiUrl || process.env.EXPO_PUBLIC_DJANGO_API_URL || "https://admin.remotehive.in";

export const djangoApiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${DJANGO_API_URL}${normalizedPath}`;
};

// --- Job API ---

export async function getJobs(filters?: any): Promise<Job[]> {
  const supabase = getSupabase();
  let query = supabase
    .from('jobs')
    .select(`
      id,
      title,
      location,
      type,
      salary_range,
      posted_at,
      tags,
      description,
      application_url,
      company:companies(id, name, logo_url, website_url, description)
    `)
    .in('status', ['active', 'approved', 'published'])
    .order('posted_at', { ascending: false });

  if (filters?.limit) {
    const offset = filters.offset || 0;
    query = query.range(offset, offset + filters.limit - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }

  return (data || []).map((job: any) => ({
    ...job,
    company_name: job.company?.name || 'Unknown Company',
    company_logo_url: job.company?.logo_url,
  })) as Job[];
}

export async function getTrendingJobs(limit: number = 10): Promise<Job[]> {
  return getJobs({ limit });
}

export async function getJob(id: string): Promise<Job | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      company:companies(id, name, logo_url, website_url, description)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching job:', error);
    return null;
  }

  const jobData = data as any;
  return {
    ...jobData,
    company_name: jobData.company?.name || 'Unknown Company',
    company_logo_url: jobData.company?.logo_url,
  } as Job;
}

// --- User API ---

export async function getUserByClerkId(clerkId: string, token?: string): Promise<UserProfile | null> {
  const supabase = getSupabase(token);
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', clerkId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return data as UserProfile | null;
}

export async function updateUserProfile(clerkId: string, updates: Partial<UserProfile>, token?: string) {
  const supabase = getSupabase(token);
  const { data, error } = await supabase
    .from('users')
    .update(updates as any)
    .eq('clerk_id', clerkId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// --- Employer API ---

export async function getEmployerDashboardStats(companyId: string) {
  const supabase = getSupabase();
  const { count: activeJobs } = await supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('company_id', companyId).in('status', ['active', 'published']);
  const { count: draftJobs } = await supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('company_id', companyId).eq('status', 'draft');
  const { count: totalApplications } = await supabase.from('applications').select('*', { count: 'exact', head: true }).in('job_id', supabase.from('jobs').select('id').eq('company_id', companyId) as any);
  return { activeJobs: activeJobs || 0, draftJobs: draftJobs || 0, totalApplications: totalApplications || 0, viewsLast30Days: 0 };
}

export async function getEmployerJobs(companyId: string): Promise<any[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('jobs').select('*').eq('company_id', companyId).order('posted_at', { ascending: false });
  if (error) { console.error('Error fetching employer jobs:', error); return []; }
  return data || [];
}

export async function createEmployerJob(job: Partial<any>): Promise<any | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('jobs').insert(job).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateEmployerJob(id: string, updates: Partial<any>): Promise<any | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('jobs').update(updates).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getJobApplications(jobId: string): Promise<any[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('applications').select('*, user:users(*)').eq('job_id', jobId).order('created_at', { ascending: false });
  if (error) { console.error('Error fetching applications:', error); return []; }
  return data || [];
}

export async function getAllApplications(companyId: string): Promise<any[]> {
  const supabase = getSupabase();
  const { data: jobs } = await supabase.from('jobs').select('id').eq('company_id', companyId);
  if (!jobs || jobs.length === 0) return [];
  const jobIds = jobs.map(j => j.id);
  const { data, error } = await supabase.from('applications').select('*, job:jobs(*), user:users(*)').in('job_id', jobIds).order('created_at', { ascending: false });
  if (error) { console.error('Error fetching all applications:', error); return []; }
  return data || [];
}

export async function updateApplicationStatus(id: string, status: string): Promise<any | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('applications').update({ status }).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateCompany(id: string, updates: Partial<any>): Promise<any | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('companies').update(updates).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

// --- Pricing / Subscriptions ---

const PLANS = [
  { id: 'free', name: 'Free', price: 0, job_posts: 1, applications: 10, features: ['1 active job post', '10 applications/mo', 'Basic analytics'] },
  { id: 'starter', name: 'Starter', price: 999, job_posts: 5, applications: 100, features: ['5 active job posts', '100 applications/mo', 'Advanced analytics', 'Company profile', 'Support'] },
  { id: 'growth', name: 'Growth', price: 2999, job_posts: 20, applications: 500, features: ['20 active job posts', '500 applications/mo', 'AI match scoring', 'Priority support', 'Team management'] },
  { id: 'enterprise', name: 'Enterprise', price: 9999, job_posts: -1, applications: -1, features: ['Unlimited job posts', 'Unlimited applications', 'SSO & Domain verify', 'Dedicated account manager', 'Custom integrations'] },
];

export function getPricingPlans() { return PLANS; }

// --- Academy API ---

export async function fetchCourses(): Promise<any[]> {
  try {
    const res = await fetch(djangoApiUrl("/api/courses/"));
    if (!res.ok) return [];
    return await res.json();
  } catch { return []; }
}

export async function fetchRoles(): Promise<any[]> {
  try {
    const res = await fetch(djangoApiUrl("/api/roles/"));
    if (!res.ok) return [];
    return await res.json();
  } catch { return []; }
}

// --- Companies API ---

export async function getCompanies(filters?: { type?: string; limit?: number; offset?: number }): Promise<any[]> {
  const supabase = getSupabase();
  let query = supabase.from('companies').select('*').order('name');
  if (filters?.type) query = query.contains('tags', [filters.type]);
  if (filters?.limit) query = query.range(filters.offset || 0, (filters.offset || 0) + filters.limit - 1);
  const { data, error } = await query;
  if (error) { console.error('Error fetching companies:', error); return []; }
  return data || [];
}

export async function getCompany(id: string): Promise<any | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('companies').select('*').eq('id', id).single();
  if (error) { console.error('Error fetching company:', error); return null; }
  return data;
}

export async function getCompanyJobs(companyId: string, limit?: number): Promise<any[]> {
  const supabase = getSupabase();
  let query = supabase.from('jobs').select('*').eq('company_id', companyId).in('status', ['active', 'approved', 'published']).order('posted_at', { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) { console.error('Error fetching company jobs:', error); return []; }
  return data || [];
}

// --- Store API (sample data until table created) ---

const SAMPLE_PRODUCTS: any[] = [
  { id: 'p1', name: 'Wireless Mouse Pro', description: 'Ergonomic wireless mouse with 6-month battery', price: 1499, original_price: 2499, images: ['https://picsum.photos/seed/mouse/400/400'], category: 'Accessories', tags: ['wireless', 'ergonomic'], rating: 4.5, review_count: 234, in_stock: true },
  { id: 'p2', name: 'Mechanical Keyboard', description: 'RGB mechanical keyboard with blue switches', price: 2999, original_price: 4999, images: ['https://picsum.photos/seed/keyboard/400/400'], category: 'Accessories', tags: ['mechanical', 'rgb'], rating: 4.3, review_count: 189, in_stock: true },
  { id: 'p3', name: 'USB-C Hub 7-in-1', description: '7-port USB-C hub with HDMI, SD, USB 3.0', price: 1999, original_price: 2999, images: ['https://picsum.photos/seed/usbhub/400/400'], category: 'Accessories', tags: ['usb-c', 'hub'], rating: 4.1, review_count: 567, in_stock: true },
  { id: 'p4', name: 'Noise Cancelling Headphones', description: 'Over-ear ANC headphones with 30h battery', price: 5499, original_price: 7999, images: ['https://picsum.photos/seed/headphones/400/400'], category: 'Audio', tags: ['anc', 'wireless'], rating: 4.7, review_count: 892, in_stock: true },
  { id: 'p5', name: 'Laptop Stand Adjustable', description: 'Adjustable aluminum laptop stand', price: 2499, original_price: 3499, images: ['https://picsum.photos/seed/stand/400/400'], category: 'Accessories', tags: ['ergonomic', 'aluminum'], rating: 4.2, review_count: 345, in_stock: true },
  { id: 'p6', name: 'Webcam 4K Ultra HD', description: '4K webcam with autofocus and ring light', price: 3999, original_price: 5999, images: ['https://picsum.photos/seed/webcam/400/400'], category: 'Electronics', tags: ['4k', 'webcam'], rating: 4.4, review_count: 178, in_stock: false },
  { id: 'p7', name: 'Resume Pro Template Bundle', description: 'ATS-optimized resume templates pack', price: 499, original_price: 999, images: ['https://picsum.photos/seed/resume/400/400'], category: 'Digital', tags: ['resume', 'templates'], rating: 4.8, review_count: 1203, in_stock: true },
  { id: 'p8', name: 'Interview Prep Guide PDF', description: 'Complete interview preparation guide', price: 299, original_price: 599, images: ['https://picsum.photos/seed/guide/400/400'], category: 'Digital', tags: ['interview', 'guide'], rating: 4.6, review_count: 876, in_stock: true },
];

export async function getProducts(category?: string): Promise<any[]> {
  // Simulate network delay
  const items = category ? SAMPLE_PRODUCTS.filter(p => p.category === category) : SAMPLE_PRODUCTS;
  return [...items];
}

export async function getProduct(id: string): Promise<any | null> {
  return SAMPLE_PRODUCTS.find(p => p.id === id) || null;
}

// --- Campaigns / Auto-Apply API ---

export async function getCampaigns(userId: string): Promise<any[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('campaigns').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) { console.error('Error fetching campaigns:', error); return []; }
  return data || [];
}

export async function createCampaign(campaign: Partial<any>): Promise<any | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('campaigns').insert(campaign).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateCampaign(id: string, updates: Partial<any>): Promise<any | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('campaigns').update(updates).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getProductCategories(): Promise<string[]> {
  const cats = [...new Set(SAMPLE_PRODUCTS.map(p => p.category))];
  return cats;
}

export const api = {
  jobs: getJobs,
  trending: getTrendingJobs,
  jobDetail: getJob,
  roles: fetchRoles,
  courses: fetchCourses,
  companies: getCompanies,
  company: getCompany,
  companyJobs: getCompanyJobs,
  products: getProducts,
  product: getProduct,
  productCategories: getProductCategories,
  campaigns: getCampaigns,
  createCampaign,
  updateCampaign,
  getEmployerDashboardStats,
  getEmployerJobs,
  createEmployerJob,
  updateEmployerJob,
  getJobApplications,
  getAllApplications,
  updateApplicationStatus,
  updateCompany,
  getPricingPlans,
};
