import { useQuery } from '@tanstack/react-query';
import { getJobs, getJob, getTrendingJobs } from '../lib/api';

export function useJobs(filters?: any) {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => getJobs(filters),
  });
}

export function useTrendingJobs(limit: number = 10) {
  return useQuery({
    queryKey: ['trending-jobs', limit],
    queryFn: () => getTrendingJobs(limit),
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => getJob(id),
    enabled: !!id,
  });
}
