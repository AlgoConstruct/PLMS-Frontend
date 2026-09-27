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

export async function addMember(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  const type = field(form, "type");
  const id = field(form, "id");
  const result = await platformApi(`/api/v1/contexts/${type}/${id}/members`, {
    method: "POST",
    body: JSON.stringify({ userId: field(form, "userId"), role: field(form, "role") }),
  });
  if (!result.ok) return failure(problemMessage(result));
  revalidatePath(`/app/c/${type}/${id}/members`);
  return success("Member added");
}

export async function removeMember(_: ActionState | undefined, form: FormData): Promise<ActionState> {
  const type = field(form, "type");
  const id = field(form, "id");
  const result = await platformApi(`/api/v1/contexts/${type}/${id}/members/${field(form, "membershipId")}`, { method: "DELETE" });
  if (!result.ok) return failure(problemMessage(result));
  revalidatePath(`/app/c/${type}/${id}/members`);
  return success("Member removed");
}
