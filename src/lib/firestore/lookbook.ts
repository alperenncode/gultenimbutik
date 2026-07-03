/** Lookbook — CLIENT SDK sorguları (admin paneli). */
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
import type { LookbookItem } from "@/types";

export async function fetchAllLookbookAdmin(): Promise<LookbookItem[]> {
  const q = query(collection(db, "lookbook"), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as LookbookItem);
}

export type LookbookInput = Omit<LookbookItem, "id">;

export async function createLookbookItem(input: LookbookInput): Promise<string> {
  const ref = await addDoc(collection(db, "lookbook"), input);
  return ref.id;
}

export async function updateLookbookItem(id: string, input: Partial<LookbookInput>): Promise<void> {
  await updateDoc(doc(db, "lookbook", id), input);
}

export async function deleteLookbookItem(id: string): Promise<void> {
  await deleteDoc(doc(db, "lookbook", id));
}
