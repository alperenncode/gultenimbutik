import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Üye Ol",
  robots: { index: false },
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[65vh]" />}>
      <AuthForm mode="kayit" />
    </Suspense>
  );
}
