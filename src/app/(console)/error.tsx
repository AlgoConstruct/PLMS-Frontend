"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ConsoleError({ reset }: { error: Error; reset: () => void }) {
  return (
    <Card className="mx-auto mt-10 max-w-lg text-center">
      <CardHeader>
        <CardTitle>Something went wrong</CardTitle>
        <CardDescription>The IAM service could not be reached or returned an unexpected error.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" onClick={reset}>Try again</Button>
      </CardContent>
    </Card>
  );
}
