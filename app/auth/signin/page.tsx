import { Suspense } from "react";
import SignInForm from "@/components/auth/SignInForm";

export const metadata = {
  title: "Sign in — Realocate.ai",
};

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <SignInForm />
    </Suspense>
  );
}
