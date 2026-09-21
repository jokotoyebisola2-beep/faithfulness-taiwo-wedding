import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  getDocFromServer,
  type Firestore,
} from 'firebase/firestore';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  onAuthStateChanged,
  type Auth,
  type User,
} from 'firebase/auth';
import { DEFAULT_WEDDING_CONTENT } from '../data/defaultContent';
import type { WeddingContent, RsvpSubmission } from '../types';

const STORAGE_CONTENT_KEY = 'faithful_taiwo_wedding_content';
const STORAGE_RSVPS_KEY = 'faithful_taiwo_wedding_rsvps';
const STORAGE_CONFIG_KEY = 'faithful_taiwo_firebase_config';
const STORAGE_ADMIN_SESSION_KEY = 'faithful_taiwo_admin_session';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;
let firebaseAuth: Auth | null = null;
let isFirebaseConfigured = false;

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: firebaseAuth?.currentUser?.uid || null,
      email: firebaseAuth?.currentUser?.email || null,
      emailVerified: firebaseAuth?.currentUser?.emailVerified || null,
      isAnonymous: firebaseAuth?.currentUser?.isAnonymous || null,
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initialize Firebase with available configuration
export function initFirebase(customConfig?: Record<string, any>) {
  try {
    let config = customConfig;
    if (!config) {
      const stored = localStorage.getItem(STORAGE_CONFIG_KEY);
      if (stored) {
        try {
          config = JSON.parse(stored);
        } catch {
          // ignore
        }
      }
    }

    if (config && config.apiKey && config.projectId) {
      if (!getApps().length) {
        firebaseApp = initializeApp(config);
      } else {
        firebaseApp = getApp();
      }
      firestoreDb = getFirestore(firebaseApp, config.firestoreDatabaseId);
      firebaseAuth = getAuth(firebaseApp);
      isFirebaseConfigured = true;

      // Validate connection
      testConnection();
      return true;
    }
  } catch (err) {
    console.warn('Firebase init warning:', err);
  }
  isFirebaseConfigured = false;
  return false;
}

// Initial test connection adhering to skill guidelines
async function testConnection() {
  if (!firestoreDb) return;
  try {
    await getDocFromServer(doc(firestoreDb, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase note: Client is offline or database initializing.');
    }
  }
}

// Initialize immediately on load
initFirebase();

export function getFirebaseStatus() {
  return {
    isConfigured: isFirebaseConfigured,
    hasAuth: !!firebaseAuth,
    hasFirestore: !!firestoreDb,
  };
}

export function saveCustomFirebaseConfig(configObj: Record<string, any>) {
  localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(configObj));
  return initFirebase(configObj);
}

// Fetch Wedding Content
export async function getWeddingContent(): Promise<WeddingContent> {
  // If firestore is available, attempt fetch
  if (firestoreDb) {
    try {
      const docRef = doc(firestoreDb, 'wedding', 'content');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as WeddingContent;
        // cache locally as backup
        localStorage.setItem(STORAGE_CONTENT_KEY, JSON.stringify(data));
        return data;
      }
    } catch (err) {
      console.warn('Firestore fetch failed, checking local cache:', err);
    }
  }

  // Fallback to local storage
  const local = localStorage.getItem(STORAGE_CONTENT_KEY);
  if (local) {
    try {
      const parsed = JSON.parse(local) as WeddingContent;
      if (
        parsed.hero?.imageUrl ===
        'https://res.cloudinary.com/dtws4emsj/image/upload/v1788559442/YIRY3537_amf4st.jpg'
      ) {
        parsed.hero.imageUrl = DEFAULT_WEDDING_CONTENT.hero.imageUrl;
        localStorage.setItem(STORAGE_CONTENT_KEY, JSON.stringify(parsed));
      }
      return parsed;
    } catch (e) {
      console.error('Failed to parse local wedding content', e);
    }
  }

  // Default seed
  return DEFAULT_WEDDING_CONTENT;
}

// Save Wedding Content (Admin)
export async function saveWeddingContent(content: WeddingContent): Promise<void> {
  const payload = {
    ...content,
    updatedAt: new Date().toISOString(),
  };

  // Always persist locally
  localStorage.setItem(STORAGE_CONTENT_KEY, JSON.stringify(payload));

  // If firestore is available, write to Firestore
  if (firestoreDb) {
    const docPath = 'wedding/content';
    try {
      await setDoc(doc(firestoreDb, 'wedding', 'content'), payload);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, docPath);
    }
  }
}

// Reset to initial default content
export async function resetToDefaultContent(): Promise<WeddingContent> {
  localStorage.removeItem(STORAGE_CONTENT_KEY);
  await saveWeddingContent(DEFAULT_WEDDING_CONTENT);
  return DEFAULT_WEDDING_CONTENT;
}

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
    // Non-fatal: An RSVP must remain saved to Firestore even if email fails
    console.warn('RSVP email notification could not be dispatched:', err);
  }
}

// Submit RSVP
export async function submitRsvp(
  submission: Omit<RsvpSubmission, 'id' | 'submittedAt'>
): Promise<RsvpSubmission> {
  const newRsvp: RsvpSubmission = {
    ...submission,
    id: 'rsvp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    submittedAt: new Date().toISOString(),
  };

  // Local persistence
  const existingStr = localStorage.getItem(STORAGE_RSVPS_KEY);
  let rsvps: RsvpSubmission[] = [];
  if (existingStr) {
    try {
      rsvps = JSON.parse(existingStr);
    } catch {
      rsvps = [];
    }
  }
  rsvps.unshift(newRsvp);
  localStorage.setItem(STORAGE_RSVPS_KEY, JSON.stringify(rsvps));

  // Firestore submission
  if (firestoreDb) {
    const docPath = `rsvps/${newRsvp.id}`;
    try {
      await setDoc(doc(firestoreDb, 'rsvps', newRsvp.id), newRsvp);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, docPath);
    }
  }

  // Trigger server-side email notification (non-blocking, fails gracefully without breaking RSVP)
  sendRsvpNotificationEmail(newRsvp).catch((err) => {
    console.warn('Background RSVP email notification caught error:', err);
  });

  return newRsvp;
}

// Fetch all RSVPs (Admin only)
export async function getRsvpList(): Promise<RsvpSubmission[]> {
  if (firestoreDb) {
    try {
      const q = query(collection(firestoreDb, 'rsvps'), orderBy('submittedAt', 'desc'));
      const querySnap = await getDocs(q);
      const list: RsvpSubmission[] = [];
      querySnap.forEach((docSnap) => {
        list.push(docSnap.data() as RsvpSubmission);
      });
      if (list.length > 0) {
        localStorage.setItem(STORAGE_RSVPS_KEY, JSON.stringify(list));
        return list;
      }
    } catch (err) {
      console.warn('Could not fetch RSVPs from Firestore, reading local storage:', err);
    }
  }

  const stored = localStorage.getItem(STORAGE_RSVPS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as RsvpSubmission[];
    } catch {
      return [];
    }
  }
  return [];
}

// Delete an RSVP (Admin)
export async function deleteRsvp(id: string): Promise<void> {
  const stored = localStorage.getItem(STORAGE_RSVPS_KEY);
  if (stored) {
    try {
      const list: RsvpSubmission[] = JSON.parse(stored);
      const filtered = list.filter((item) => item.id !== id);
      localStorage.setItem(STORAGE_RSVPS_KEY, JSON.stringify(filtered));
    } catch {
      // ignore
    }
  }

  if (firestoreDb) {
    const docPath = `rsvps/${id}`;
    try {
      await deleteDoc(doc(firestoreDb, 'rsvps', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, docPath);
    }
  }
}

// Admin Authentication Service
export async function signInAdminWithGoogle(): Promise<User | null> {
  if (!firebaseAuth) {
    throw new Error('Firebase Auth is not configured yet. You can sign in using the Admin Passcode.');
  }
  const provider = new GoogleAuthProvider();
  const res = await signInWithPopup(firebaseAuth, provider);
  localStorage.setItem(STORAGE_ADMIN_SESSION_KEY, 'true');
  return res.user;
}

export function checkAdminSession(): boolean {
  if (localStorage.getItem(STORAGE_ADMIN_SESSION_KEY) === 'true') {
    return true;
  }
  if (firebaseAuth?.currentUser) {
    return true;
  }
  return false;
}

export function loginWithPasscode(passcode: string): boolean {
  // Default wedding passcode for the couple
  const validPasscodes = ['faithful2026', 'taiwo2026', 'ft2026', 'admin'];
  if (validPasscodes.includes(passcode.trim().toLowerCase())) {
    localStorage.setItem(STORAGE_ADMIN_SESSION_KEY, 'true');
    return true;
  }
  return false;
}

export async function adminSignOut(): Promise<void> {
  localStorage.removeItem(STORAGE_ADMIN_SESSION_KEY);
  if (firebaseAuth) {
    try {
      await fbSignOut(firebaseAuth);
    } catch {
      // ignore
    }
  }
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  if (!firebaseAuth) return () => {};
  return onAuthStateChanged(firebaseAuth, callback);
}
