"use client";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth } from "./firebase";
import { ADMIN_EMAILS } from "./constants";

const requireAuth = () => {
  if (!auth) throw new Error("Firebase n'est pas configuré. Remplissez les variables d'environnement.");
  return auth;
};

export const signIn = (email: string, password: string) =>
  signInWithEmailAndPassword(requireAuth(), email, password);

export const signUp = (email: string, password: string) =>
  createUserWithEmailAndPassword(requireAuth(), email, password);

export const signOut = () => firebaseSignOut(requireAuth());

export const signInWithGoogle = () =>
  signInWithPopup(requireAuth(), new GoogleAuthProvider());

export const isAdmin = (user: User | null): boolean =>
  !!user?.email && ADMIN_EMAILS.includes(user.email);

export const subscribeToAuth = (callback: (user: User | null) => void) =>
  auth ? onAuthStateChanged(auth, callback) : () => {};
