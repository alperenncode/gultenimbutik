import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountTabs } from "@/components/auth/AccountTabs";

export const metadata: Metadata = {
  title: "Hesabım",
  robots: { index: false },
};

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh]" />}>
      <AccountTabs />
    </Suspense>
  );
}
