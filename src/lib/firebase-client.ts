/**
 * Firebase CLIENT SDK — yalnızca tarayıcıda ('use client' bileşenlerinde) kullanılır.
 *
 * Bu config public'tir (her Firebase web uygulamasında tarayıcıya gönderilir);
 * gerçek güvenlik firestore.rules ve storage.rules ile sağlanır.
 * Server Component'lerde bu dosyayı DEĞİL, firebase-admin.ts'i kullanın.
 */
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCnsKE4dP1a0UKBl2IaRWbeN7JggwCgujE",
  authDomain: "gultenimbutik.firebaseapp.com",
  projectId: "gultenimbutik",
  storageBucket: "gultenimbutik.firebasestorage.app",
  messagingSenderId: "194718506138",
  appId: "1:194718506138:web:cb3ea1eb420c8920945323",
};

// Hot-reload sırasında "already initialized" hatasını önle
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
