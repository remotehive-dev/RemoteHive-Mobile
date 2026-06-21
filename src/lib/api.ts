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
  // Simplified for MVP UI verification
  return {
    activeJobs: 12,
    totalApplications: 45,
    viewsLast30Days: 1200,
  };
}

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

export const api = {
  jobs: getJobs,
  trending: getTrendingJobs,
  jobDetail: getJob,
  roles: fetchRoles,
  courses: fetchCourses,
};
