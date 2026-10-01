import type { Metadata } from "next";
import { AuthPage } from "./auth-page";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  return <AuthPage params={await searchParams} />;
}
