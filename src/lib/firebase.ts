import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  Auth,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  collection,
  getDoc,
  setDoc,
  updateDoc,
  Firestore
} from 'firebase/firestore';

// Environment variables configuration
const metaEnv = (import.meta as any).env || {};
const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || '',
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: metaEnv.VITE_FIREBASE_APP_ID || ''
};

// Check if a valid real configuration is supplied
const isRealFirebaseConfigured = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== '' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== '';

let app: any;
let authInstance: any;
let dbInstance: any;

// A highly robust local simulated auth user representation
export interface SimulatedAuthUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName: string;
  photoURL: string;
  getIdToken: () => Promise<string>;
}

// Simulated Firebase Engine fallback (Repository / Adapter pattern)
class SimulatedAuth {
  currentUser: SimulatedAuthUser | null = null;
  private listeners: ((user: SimulatedAuthUser | null) => void)[] = [];

  constructor() {
    // Restore session from localStorage if present
    const savedUser = localStorage.getItem('cvforge_sim_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        this.currentUser = {
          uid: parsed.uid,
          email: parsed.email,
          emailVerified: parsed.emailVerified ?? false,
          displayName: parsed.displayName || '',
          photoURL: parsed.photoURL || '',
          getIdToken: async () => localStorage.getItem('cvforge_token') || 'simulated_token'
        };
      } catch (e) {
        console.error('Failed to restore simulated user session', e);
      }
    }
  }

  onAuthStateChanged(callback: (user: SimulatedAuthUser | null) => void) {
    this.listeners.push(callback);
    // Trigger immediately with current state
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private triggerListeners() {
    this.listeners.forEach(callback => callback(this.currentUser));
  }

  async signInWithEmailAndPassword(emailVal: string, passwordVal: string): Promise<any> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailVal, password: passwordVal })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Invalid credentials');
    }

    localStorage.setItem('cvforge_token', data.token);
    const simUser: SimulatedAuthUser = {
      uid: data.user.id,
      email: data.user.email,
      emailVerified: data.user.isVerified ?? false,
      displayName: data.user.fullName,
      photoURL: data.user.profilePhoto || '',
      getIdToken: async () => data.token
    };
    this.currentUser = simUser;
    localStorage.setItem('cvforge_sim_user', JSON.stringify({
      uid: simUser.uid,
      email: simUser.email,
      emailVerified: simUser.emailVerified,
      displayName: simUser.displayName,
      photoURL: simUser.photoURL
    }));
    this.triggerListeners();
    return { user: simUser, token: data.token, customProfile: data.user };
  }

  async createUserWithEmailAndPassword(
    emailVal: string, 
    passwordVal: string, 
    fullName: string, 
    username: string, 
    country: string, 
    phone: string
  ): Promise<any> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: emailVal,
        password: passwordVal,
        confirmPassword: passwordVal,
        fullName,
        username,
        country,
        phone,
        plan: 'free'
      })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    localStorage.setItem('cvforge_token', data.token);
    const simUser: SimulatedAuthUser = {
      uid: data.user.id,
      email: data.user.email,
      emailVerified: false, // Initially unverified for email signup
      displayName: data.user.fullName,
      photoURL: '',
      getIdToken: async () => data.token
    };
    this.currentUser = simUser;
    localStorage.setItem('cvforge_sim_user', JSON.stringify({
      uid: simUser.uid,
      email: simUser.email,
      emailVerified: simUser.emailVerified,
      displayName: simUser.displayName,
      photoURL: simUser.photoURL
    }));
    this.triggerListeners();
    return { user: simUser, token: data.token, customProfile: data.user };
  }

  async signInWithPopupGoogle(emailVal: string, nameVal: string, photoURLVal?: string): Promise<any> {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: emailVal,
        name: nameVal,
        googleId: `g_sim_${Date.now()}`
      })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Google Sign-In failed');
    }

    localStorage.setItem('cvforge_token', data.token);
    const simUser: SimulatedAuthUser = {
      uid: data.user.id,
      email: data.user.email,
      emailVerified: true, // Google login automatically verified
      displayName: data.user.fullName,
      photoURL: photoURLVal || '',
      getIdToken: async () => data.token
    };
    this.currentUser = simUser;
    localStorage.setItem('cvforge_sim_user', JSON.stringify({
      uid: simUser.uid,
      email: simUser.email,
      emailVerified: simUser.emailVerified,
      displayName: simUser.displayName,
      photoURL: simUser.photoURL
    }));
    this.triggerListeners();
    return { user: simUser, token: data.token, customProfile: data.user };
  }

  async signOut() {
    this.currentUser = null;
    localStorage.removeItem('cvforge_token');
    localStorage.removeItem('cvforge_sim_user');
    localStorage.removeItem('cvforge_user');
    this.triggerListeners();
  }

  async sendEmailVerification() {
    if (!this.currentUser) throw new Error('No user authenticated');
    const res = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: this.currentUser.email })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to trigger verification mail.');
    }
    return true;
  }

  async sendPasswordResetEmail(emailVal: string) {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailVal })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to request reset link.');
    }
    return data;
  }
}

// Configure Real or Simulated Firebase Export
if (isRealFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
    console.log('[FIREBASE] Real Firebase successfully initialized.');
  } catch (err) {
    console.warn('[FIREBASE] Real Firebase initialization failed, entering local simulated fallback.', err);
    authInstance = new SimulatedAuth();
    dbInstance = {};
  }
} else {
  console.log('[FIREBASE] Missing API keys. Initialized local robust Simulated Firebase engine.');
  authInstance = new SimulatedAuth();
  dbInstance = {};
}

export const auth = authInstance;
export const db = dbInstance;

// Common adapter functions so that other parts of the system can call Firestore-like functions
export { doc, collection, getDoc, setDoc, updateDoc };
export { GoogleAuthProvider, signInWithPopup };
