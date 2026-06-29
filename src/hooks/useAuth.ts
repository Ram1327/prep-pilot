import { useState, useEffect } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { storage } from '../lib/storage';

const isDev = import.meta.env.DEV;

export interface AuthUser {
  uid: string;
  email: string;
  name: string;
  photoURL: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(
    sessionStorage.getItem('google_access_token')
  );

  useEffect(() => {
    isDev && console.log("useAuth: setting up onAuthStateChanged listener");
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      isDev && console.log("useAuth: onAuthStateChanged triggered, user:", firebaseUser ? "[uid]" : "null");
      if (firebaseUser) {
        const authUser: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          photoURL: firebaseUser.photoURL || '',
        };
        setUser(authUser);
        setAuthLoading(false);

        // Run user profile sync in the background so it doesn't block UI load
        (async () => {
          try {
            const userRef = doc(db, 'users', firebaseUser.uid);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
              await setDoc(userRef, {
                email: authUser.email,
                name: authUser.name,
                photoURL: authUser.photoURL,
                createdAt: serverTimestamp(),
              });
            }
          } catch (fbError) {
            console.error("Failed to sync user profile to Firestore:", fbError);
          }
        })();
      } else {
        setUser(null);
        setAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;
      
      if (accessToken) {
        // Store the access token for Google API calls
        // This token expires after ~1 hour
        sessionStorage.setItem('google_access_token', accessToken);
        sessionStorage.setItem('google_token_expiry', String(Date.now() + 3500 * 1000));
        setGoogleAccessToken(accessToken);
      }
    } catch (error: any) {
      isDev && console.error('Sign in failed:', error.message);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<void> => {
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged handles the rest
  };

  const signUpWithEmail = async (name: string, email: string, password: string): Promise<void> => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Set the display name on the Firebase user profile
    await updateProfile(credential.user, { displayName: name });
    
    // Create user doc in Firestore (run in background, do NOT await it)
    const userRef = doc(db, 'users', credential.user.uid);
    setDoc(userRef, {
      email,
      name,
      photoURL: '',
      createdAt: serverTimestamp(),
    }).catch((err) => {
      isDev && console.warn("Failed to save user profile to Firestore:", err);
    });
  };

  const resetPassword = async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    await signOut(auth);
    // Clear local session
    localStorage.removeItem('preppilot_logged_in_user');
    localStorage.removeItem('preppilot_tasks_v1');
    storage.clearAllSessionData();
    sessionStorage.removeItem('google_access_token');
    sessionStorage.removeItem('google_token_expiry');
    setGoogleAccessToken(null);
  };

  return { user, authLoading, googleAccessToken, signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, logout };
}
