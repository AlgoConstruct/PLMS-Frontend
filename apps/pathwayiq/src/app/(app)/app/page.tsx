import { PageHeader } from "@pathwayiq/ui/blocks/page";
import { Badge } from "@pathwayiq/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@pathwayiq/ui/components/card";
import { getMe } from "@pathwayiq/api/data";
import { getNavigation } from "@pathwayiq/api/platform";

export default async function AppHome() {
  const [me, nav] = await Promise.all([getMe(), getNavigation("global")]);
  return (
    <>
      <PageHeader title={`Welcome, ${me.user.displayName}`}
                  description="This menu is built by the platform from your permissions; nothing here is decided by role names." />
      <Card>
        <CardHeader>
          <CardTitle>Platform capabilities</CardTitle>
          <CardDescription>Platform permissions you hold somewhere, as returned by GET /navigation?context=global</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-1.5">
          {nav.capabilities.length === 0 ? <span className="text-sm text-muted-foreground">None yet</span>
            : nav.capabilities.map((c) => <Badge key={c} variant="outline" className="font-mono">{c}</Badge>)}
        </CardContent>
      </Card>
    </>
  );
}
