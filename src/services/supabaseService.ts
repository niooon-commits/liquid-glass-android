/**
 * Supabase Edge Functions & Serverless Architecture Service
 *
 * Directives:
 * - Application code is strictly a client-side SPA without local Express/Node backend servers.
 * - Persistent real-time database and authentication are driven by Firebase.
 * - Server-side computing and background workflows are delegated to Supabase Edge Functions.
 */

export interface SupabaseConfig {
  projectRef: string;
  region: string;
  status: string;
  functionsEndpoint: string;
}

export const SUPABASE_ARCHITECTURE: SupabaseConfig = {
  projectRef: 'rpagjdzvpaylxnqiddvb',
  region: 'ap-southeast-1',
  status: 'ACTIVE_HEALTHY',
  functionsEndpoint: 'https://rpagjdzvpaylxnqiddvb.supabase.co/functions/v1',
};

/**
 * Invoke a remote Supabase Edge Function without needing any local Node server
 */
export async function invokeSupabaseFunction<T = unknown>(
  functionName: string,
  payload?: Record<string, unknown>
): Promise<{ data: T | null; error: string | null }> {
  try {
    const url = `${SUPABASE_ARCHITECTURE.functionsEndpoint}/${functionName}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload ? JSON.stringify(payload) : undefined,
    });

    if (!response.ok) {
      return {
        data: null,
        error: `Supabase Function HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to reach Supabase Function';
    return { data: null, error: message };
  }
}
