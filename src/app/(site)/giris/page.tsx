import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Giriş Yap",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[65vh]" />}>
      <AuthForm mode="giris" />
    </Suspense>
  );
}
