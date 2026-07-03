/** Kategoriler — CLIENT SDK sorguları (mega menü, admin paneli). */
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import type { Category } from "@/types";

export async function fetchCategories(): Promise<Category[]> {
  const q = query(collection(db, "categories"), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Category);
}

export type CategoryInput = Omit<Category, "id">;

export async function createCategory(input: CategoryInput): Promise<string> {
  const ref = await addDoc(collection(db, "categories"), input);
  return ref.id;
}

export async function updateCategory(id: string, input: Partial<CategoryInput>): Promise<void> {
  await updateDoc(doc(db, "categories", id), input);
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, "categories", id));
}
