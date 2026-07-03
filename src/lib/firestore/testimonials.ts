/** Müşteri yorumları — CLIENT SDK sorguları (admin paneli). */
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
import type { Testimonial } from "@/types";

export async function fetchAllTestimonialsAdmin(): Promise<Testimonial[]> {
  const q = query(collection(db, "testimonials"), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Testimonial);
}

export type TestimonialInput = Omit<Testimonial, "id">;

export async function createTestimonial(input: TestimonialInput): Promise<string> {
  const ref = await addDoc(collection(db, "testimonials"), input);
  return ref.id;
}

export async function updateTestimonial(id: string, input: Partial<TestimonialInput>): Promise<void> {
  await updateDoc(doc(db, "testimonials", id), input);
}

export async function deleteTestimonial(id: string): Promise<void> {
  await deleteDoc(doc(db, "testimonials", id));
}
