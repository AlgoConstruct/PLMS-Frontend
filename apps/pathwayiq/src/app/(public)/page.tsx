import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ACCESS_COOKIE } from "@pathwayiq/auth/session";
import { LandingExperience } from "./landing-experience";

export const metadata: Metadata = {
  title: "Learn with purpose. Build what’s next.",
  description: "Meet Pathway IQ, an Academic Operating System connecting learning, student innovation, and institutions—with a vision for AI-powered guidance.",
};

export default async function Landing() {
  const signedIn = Boolean((await cookies()).get(ACCESS_COOKIE)?.value);
  return <LandingExperience signedIn={signedIn} />;
}
