import type { Metadata } from "next";
import { AuthPage } from "../login/auth-page";

export const metadata: Metadata = { title: "Sign up" };

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  return <AuthPage params={await searchParams} initialMode="signup" />;
}
