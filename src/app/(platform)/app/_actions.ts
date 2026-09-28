"use server";

import { revalidatePath } from "next/cache";
import { failure, success, type ActionState } from "@/lib/action-state";
import { problemMessage } from "@/lib/api";
import { field } from "@/lib/mutate";
import { platformApi } from "@/lib/platform";

export async function createWorkspace(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  const result = await platformApi<{ id: string; name: string }>("/api/v1/workspaces", {
    method: "POST",
    body: JSON.stringify({ name: field(form, "name"), description: field(form, "description"), visibility: field(form, "visibility") ?? "PRIVATE" }),
  });
  if (!result.ok) return failure(problemMessage(result));
  revalidatePath("/app/workspaces");
  return success(`${result.data.name} created`, `/app/c/workspace/${result.data.id}`);
}

export async function bulkAddMembers(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  const type = field(form, "type");
  const id = field(form, "id");
  const userIds = form.getAll("userIds").filter((v): v is string => typeof v === "string");
  if (userIds.length === 0) return failure("Select at least one person");
  const result = await platformApi<{ added: unknown[]; skipped: string[] }>(`/api/v1/contexts/${type}/${id}/members/bulk`, {
    method: "POST",
    body: JSON.stringify({ userIds, role: field(form, "role") }),
  });
  if (!result.ok) return failure(problemMessage(result));
  revalidatePath(`/app/c/${type}/${id}/members`);
  const { added, skipped } = result.data;
  return success(skipped.length > 0 ? `${added.length} added, ${skipped.length} skipped` : `${added.length} added`);
}

export async function removeMember(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  const type = field(form, "type");
  const id = field(form, "id");
  const result = await platformApi(`/api/v1/contexts/${type}/${id}/members/${field(form, "membershipId")}`, { method: "DELETE" });
  if (!result.ok) return failure(problemMessage(result));
  revalidatePath(`/app/c/${type}/${id}/members`);
  return success("Member removed");
}
