"use server";

import { revalidatePath } from "next/cache";
import { failure, successWithSecret, type ActionState } from "@/lib/action-state";
import { api, problemMessage } from "@/lib/api";
import { field, mutate } from "@/lib/mutate";
import type { CreatedServiceClient, ServiceClient } from "@/lib/types";

const PATHS = ["/service-clients"];

/** "project, lms_core" -> ["project", "lms_core"] */
function prefixes(form: FormData): string[] {
  return (field(form, "prefixes") ?? "").split(/[\s,]+/).map((p) => p.trim().toLowerCase()).filter(Boolean);
}

export async function createServiceClient(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  const result = await api<CreatedServiceClient>("/api/v1/iam/service-clients", {
    method: "POST",
    body: JSON.stringify({ clientId: field(form, "clientId")?.toLowerCase(), name: field(form, "name"), prefixes: prefixes(form) }),
  });
  if (!result.ok) return failure(problemMessage(result));
  revalidatePath(PATHS[0]);
  return successWithSecret(`Service client ${result.data.client.clientId} created`, result.data.clientSecret);
}

export async function rotateServiceClientSecret(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  const result = await api<CreatedServiceClient>(`/api/v1/iam/service-clients/${field(form, "id")}/rotate-secret`, { method: "POST" });
  if (!result.ok) return failure(problemMessage(result));
  revalidatePath(PATHS[0]);
  return successWithSecret(`New secret for ${result.data.client.clientId}. The old one no longer works.`, result.data.clientSecret);
}

export async function updateServiceClient(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return mutate<ServiceClient>(`/api/v1/iam/service-clients/${field(form, "id")}`, "PATCH",
    { name: field(form, "name"), prefixes: prefixes(form) },
    (c) => `${c.clientId} updated`, PATHS);
}

export async function setServiceClientStatus(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  return mutate<ServiceClient>(`/api/v1/iam/service-clients/${field(form, "id")}`, "PATCH",
    { status: field(form, "status") },
    (c) => `${c.clientId} is now ${c.status.toLowerCase()}`, PATHS);
}
