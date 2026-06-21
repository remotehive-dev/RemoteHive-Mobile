import { createClient, SupabaseClient } from "@supabase/supabase-js";
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

let client: SupabaseClient | null = null;
let authenticatedClient: { token: string, client: SupabaseClient } | null = null;

export function getSupabase(accessToken?: string) {
  if (accessToken) {
    if (authenticatedClient?.token === accessToken) {
      return authenticatedClient.client;
    }

    const newClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    authenticatedClient = { token: accessToken, client: newClient };
    return newClient;
  }

  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return client;
}
