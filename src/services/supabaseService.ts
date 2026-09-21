import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { WeddingContent, RsvpSubmission, WeddingPhoto } from '../types';
import { DEFAULT_WEDDING_CONTENT } from '../data/defaultContent';

const STORAGE_KEY_CONTENT = 'faithfulness_taiwo_wedding_content_v1';
const STORAGE_KEY_RSVPS = 'faithfulness_taiwo_wedding_rsvps_v1';
const STORAGE_KEY_ADMIN = 'faithfulness_taiwo_admin_session';
const STORAGE_KEY_CONFIG = 'faithfulness_taiwo_supabase_config';
const DEFAULT_PASSCODE = 'faithful2026';
const BUCKET_NAME = 'wedding-images';

interface SupabaseSavedConfig {
  url: string;
  anonKey: string;
}

let supabaseInstance: SupabaseClient | null = null;

// Resolve Supabase project credentials from env or runtime storage
export function getSupabaseCredentials(): { url: string; anonKey: string } {
  // Check runtime localStorage first (configured via CMS)
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (stored) {
        const parsed: SupabaseSavedConfig = JSON.parse(stored);
        if (parsed.url && parsed.anonKey) {
          return { url: parsed.url.trim(), anonKey: parsed.anonKey.trim() };
        }
      }
    } catch {
      // ignore
    }
  }

  // Vite environment variables
  const envUrl =
    (import.meta as any).env?.VITE_SUPABASE_URL ||
    (import.meta as any).env?.SUPABASE_URL ||
    (typeof process !== 'undefined' ? process.env?.SUPABASE_URL : '') ||
    '';

  const envKey =
    (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
    (import.meta as any).env?.SUPABASE_PUBLISHABLE_KEY ||
    (typeof process !== 'undefined' ? process.env?.SUPABASE_PUBLISHABLE_KEY : '') ||
    '';

  return {
    url: String(envUrl).trim(),
    anonKey: String(envKey).trim(),
  };
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(url && anonKey && url.startsWith('http'));
}

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const { url, anonKey } = getSupabaseCredentials();
  if (url && anonKey && url.startsWith('http')) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      return supabaseInstance;
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
    }
  }

  return null;
}

export function saveSupabaseConfig(url: string, anonKey: string): boolean {
  try {
    const cleanUrl = url.trim();
    const cleanKey = anonKey.trim();
    if (!cleanUrl || !cleanKey) return false;

    // Test client creation
    const testClient = createClient(cleanUrl, cleanKey);
    if (!testClient) return false;

    if (typeof window !== 'undefined') {
      localStorage.setItem(
        STORAGE_KEY_CONFIG,
        JSON.stringify({ url: cleanUrl, anonKey: cleanKey })
      );
    }
    supabaseInstance = testClient;
    return true;
  } catch (err) {
    console.error('Error saving Supabase config:', err);
    return false;
  }
}

export function getSupabaseStatus(): {
  isConfigured: boolean;
  url: string;
  hasKey: boolean;
} {
  const creds = getSupabaseCredentials();
  return {
    isConfigured: isSupabaseConfigured(),
    url: creds.url,
    hasKey: Boolean(creds.anonKey),
  };
}

// ==============================================================================
// WEDDING CONTENT FETCH & SAVE (PRIMARY STORAGE: SUPABASE 'wedding_content' TABLE)
// ==============================================================================

/**
 * Loads wedding content from Supabase 'wedding_content' table (row id: 'main').
 * If table is empty or row does not exist, returns DEFAULT_WEDDING_CONTENT gracefully.
 * Does NOT store the full content in localStorage to avoid quota errors.
 */
export async function getWeddingContent(): Promise<WeddingContent> {
  // Actively clean up any legacy bloated content from localStorage
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY_CONTENT);
    } catch {
      // ignore
    }
  }

  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('wedding_content')
        .select('id, content, updated_at')
        .eq('id', 'main')
        .maybeSingle();

      if (!error && data && data.content) {
        const parsed =
          typeof data.content === 'object' ? data.content : JSON.parse(data.content);

        return {
          ...DEFAULT_WEDDING_CONTENT,
          ...parsed,
          updatedAt: data.updated_at || parsed.updatedAt || new Date().toISOString(),
        };
      } else if (error) {
        console.warn('Supabase fetch notice for wedding_content table:', error.message);
      }
    } catch (err) {
      console.warn('Could not read wedding_content from Supabase:', err);
    }
  }

  return DEFAULT_WEDDING_CONTENT;
}

/**
 * Saves the complete CMS content object to the 'wedding_content' Supabase table
 * inside the 'content' JSONB column under the stable row id 'main'.
 * Automatically updates 'updated_at'.
 */
export async function saveWeddingContent(content: WeddingContent): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client is not configured. Please check your Supabase credentials in Tab 10.');
  }

  // Ensure write operations dispatch with an active Supabase user session
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      // If anonymous auth is enabled in Supabase project, acquire session
      await supabase.auth.signInAnonymously().catch(() => {});
    }
  } catch (authErr) {
    console.warn('Supabase auth session check notice:', authErr);
  }

  const now = new Date().toISOString();
  const updatedContent = {
    ...content,
    updatedAt: now,
  };

  // Upsert the full CMS content object into 'wedding_content' table under row id 'main'
  const { error } = await supabase
    .from('wedding_content')
    .upsert(
      {
        id: 'main',
        content: updatedContent,
        updated_at: now,
      },
      { onConflict: 'id' }
    );

  if (error) {
    console.error('Error saving to Supabase wedding_content table:', error);
    throw new Error(`Failed to save to Supabase 'wedding_content': ${error.message}`);
  }

  // Ensure legacy localStorage key is removed so quota is never exceeded
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY_CONTENT);
    } catch {
      // ignore
    }
  }
}

/**
 * Subscribes to live Postgres changes on 'wedding_content' table (row id: 'main').
 * Automatically invokes callback whenever content is updated in CMS.
 */
export function subscribeToContentUpdates(
  callback: (newContent: WeddingContent) => void
): () => void {
  const supabase = getSupabaseClient();
  if (!supabase) return () => {};

  try {
    const channel = supabase
      .channel('realtime:wedding_content_main')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wedding_content',
          filter: 'id=eq.main',
        },
        (payload) => {
          if (payload.new && (payload.new as any).content) {
            const raw = (payload.new as any).content;
            const parsed = typeof raw === 'object' ? raw : JSON.parse(raw);
            callback({
              ...DEFAULT_WEDDING_CONTENT,
              ...parsed,
              updatedAt: (payload.new as any).updated_at || parsed.updatedAt || new Date().toISOString(),
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Realtime subscription setup issue:', err);
    return () => {};
  }
}

export async function resetToDefaultContent(): Promise<WeddingContent> {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY_CONTENT);
    } catch {
      // ignore
    }
  }
  const defaultClone = JSON.parse(JSON.stringify(DEFAULT_WEDDING_CONTENT));
  try {
    await saveWeddingContent(defaultClone);
  } catch (err) {
    console.warn('Reset to defaults remote sync notice:', err);
  }
  return defaultClone;
}

// ==============================================================================
// IMAGE STORAGE (Supabase Storage: bucket 'wedding-images')
// ==============================================================================

export async function uploadWeddingImage(
  file: File,
  folder: 'hero' | 'gallery' | 'closing' = 'gallery'
): Promise<string> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase is not connected. Please configure your Supabase URL & Key in Settings.');
  }

  // Create unique file path with timestamp & random token to prevent stale cache
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const extension = cleanFileName.split('.').pop() || 'jpg';
  const uniqueName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${extension}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(uniqueName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Storage upload error:', error);
    throw new Error(`Image upload failed: ${error.message}`);
  }

  const { data: publicData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return publicData.publicUrl;
}

export async function deleteWeddingImage(imageUrlOrPath: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase || !imageUrlOrPath) return;

  try {
    // Extract relative storage path if it belongs to wedding-images bucket
    let relativePath = imageUrlOrPath;
    if (imageUrlOrPath.includes(BUCKET_NAME)) {
      const parts = imageUrlOrPath.split(`${BUCKET_NAME}/`);
      if (parts[1]) relativePath = parts[1];
    }

    await supabase.storage.from(BUCKET_NAME).remove([relativePath]);
  } catch (err) {
    console.warn('Notice: Could not delete image from Supabase storage:', err);
  }
}

// ==============================================================================
// RSVP SUBMISSIONS
// ==============================================================================

// Trigger server-side email notification via /api/send-rsvp-notification
export async function sendRsvpNotificationEmail(rsvp: RsvpSubmission): Promise<void> {
  try {
    const res = await fetch('/api/send-rsvp-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rsvp),
    });
    if (!res.ok) {
      console.warn('RSVP email notification returned HTTP status:', res.status);
    }
  } catch (err) {
    console.warn('RSVP email notification could not be dispatched:', err);
  }
}

export async function submitRsvp(
  submission: Omit<RsvpSubmission, 'id' | 'submittedAt'>
): Promise<RsvpSubmission> {
  const newRsvp: RsvpSubmission = {
    ...submission,
    id: 'rsvp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    submittedAt: new Date().toISOString(),
  };

  // 1. Always save to local cache
  if (typeof window !== 'undefined') {
    try {
      const existingStr = localStorage.getItem(STORAGE_KEY_RSVPS);
      const list: RsvpSubmission[] = existingStr ? JSON.parse(existingStr) : [];
      list.unshift(newRsvp);
      localStorage.setItem(STORAGE_KEY_RSVPS, JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  // 2. Insert into Supabase table 'rsvps'
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('rsvps')
        .insert([
          {
            guest_name: submission.name,
            attendance: submission.attendance,
            number_of_guests: submission.guestCount,
            phone: submission.phone || null,
            message: submission.message || null,
          },
        ])
        .select()
        .single();

      if (data && !error) {
        newRsvp.id = data.id;
        newRsvp.submittedAt = data.created_at || newRsvp.submittedAt;
      } else if (error) {
        console.warn('Supabase RSVP insert error (falling back to cache):', error.message);
      }
    } catch (err) {
      console.warn('Supabase RSVP insert exception:', err);
    }
  }

  // 3. Trigger email notification (non-blocking)
  sendRsvpNotificationEmail(newRsvp).catch((err) => {
    console.warn('Background RSVP email error:', err);
  });

  return newRsvp;
}

export async function getRsvpList(): Promise<RsvpSubmission[]> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('rsvps')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && !error) {
        const list: RsvpSubmission[] = data.map((item: any) => ({
          id: String(item.id),
          name: item.guest_name,
          attendance: item.attendance === 'no' ? 'no' : 'yes',
          guestCount: Number(item.number_of_guests || 0),
          phone: item.phone || undefined,
          message: item.message || undefined,
          submittedAt: item.created_at || new Date().toISOString(),
        }));

        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY_RSVPS, JSON.stringify(list));
        }
        return list;
      }
    } catch (err) {
      console.warn('Could not load RSVPs from Supabase, loading from cache:', err);
    }
  }

  // Fallback to local storage
  if (typeof window !== 'undefined') {
    const existingStr = localStorage.getItem(STORAGE_KEY_RSVPS);
    if (existingStr) {
      try {
        return JSON.parse(existingStr);
      } catch {
        return [];
      }
    }
  }

  return [];
}

export async function deleteRsvp(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('rsvps').delete().eq('id', id);
    } catch (err) {
      console.warn('Error deleting RSVP from Supabase:', err);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const existingStr = localStorage.getItem(STORAGE_KEY_RSVPS);
      if (existingStr) {
        const list: RsvpSubmission[] = JSON.parse(existingStr);
        const filtered = list.filter((r) => r.id !== id);
        localStorage.setItem(STORAGE_KEY_RSVPS, JSON.stringify(filtered));
      }
    } catch {
      // ignore
    }
  }
}

// ==============================================================================
// ADMIN AUTHENTICATION
// ==============================================================================

export function checkAdminSession(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY_ADMIN) === 'true';
}

export function loginWithPasscode(passcode: string): boolean {
  if (passcode.trim() === DEFAULT_PASSCODE) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_ADMIN, 'true');
    }
    return true;
  }
  return false;
}

export async function loginWithSupabaseAuth(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client is not configured yet.' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_ADMIN, 'true');
  }
  return { success: true };
}

export async function adminSignOut(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_ADMIN);
  }
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }
}
