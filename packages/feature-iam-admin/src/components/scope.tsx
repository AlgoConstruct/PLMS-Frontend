import { Globe2, MapPin } from "lucide-react";
import { Badge } from "@pathwayiq/ui/components/badge";
import type { Assignment, ScopeMode } from "@pathwayiq/api/iam-types";

const scopeLabels: Record<ScopeMode, string> = {
  CURRENT_NODE: "node only",
  DESCENDANTS: "below node",
  CURRENT_AND_DESCENDANTS: "node + subtree",
};

export function ScopeModeBadge({ mode }: { mode: ScopeMode }) {
  return <Badge variant={mode === "CURRENT_AND_DESCENDANTS" ? "secondary" : "outline"}>{scopeLabels[mode]}</Badge>;
}

export function ScopeLabel({ assignment }: { assignment: Pick<Assignment, "scopeType" | "node"> }) {
  return assignment.scopeType === "GLOBAL" ? (
    <span className="inline-flex items-center gap-1.5"><Globe2 className="size-3.5 text-amber-600" /> Global</span>
  ) : (
    <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5 text-primary" /> {assignment.node?.name}</span>
  );
}
