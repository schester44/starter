import { useState } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { getSessionFn } from "@/lib/session";
import { organization } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2 } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  beforeLoad: async () => {
    const session = await getSessionFn();

    if (!session) {
      throw redirect({ to: "/login" });
    }

    // If user already has organizations, redirect to dashboard
    if (session.organizations.length > 0) {
      throw redirect({ to: "/dashboard" });
    }

    return { session };
  },
  component: OnboardingPage,
});

function OnboardingPage() {
  const { session } = Route.useRouteContext();
  const navigate = useNavigate();

  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orgName || !orgSlug) return;

    setIsCreating(true);
    setError(null);

    try {
      const result = await organization.create({
        name: orgName,
        slug: orgSlug,
      });

      if (result.error) {
        setError(result.error.message || "Failed to create organization");
        setIsCreating(false);
        return;
      }

      if (result.data) {
        // Set as active organization
        await organization.setActive({ organizationId: result.data.id });
        // Navigate to dashboard
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setIsCreating(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Welcome to Flightplan!</h1>
          <p className="text-muted-foreground mt-2">
            Let's create your first organization to get started.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <form onSubmit={handleCreateOrg} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="orgName" className="text-sm font-medium">
                Organization Name
              </label>
              <Input
                id="orgName"
                placeholder="Acme Inc."
                value={orgName}
                onChange={(e) => {
                  setOrgName(e.target.value);
                  setOrgSlug(generateSlug(e.target.value));
                }}
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="orgSlug" className="text-sm font-medium">
                URL Slug
              </label>
              <Input
                id="orgSlug"
                placeholder="acme-inc"
                value={orgSlug}
                onChange={(e) => setOrgSlug(e.target.value)}
                disabled={isCreating}
              />
              <p className="text-xs text-muted-foreground">
                Your workspace URL: flightplan.app/{orgSlug || "your-slug"}
              </p>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={!orgName || !orgSlug || isCreating}
            >
              {isCreating ? "Creating..." : "Create Organization"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Signed in as {session.user.email}
        </p>
      </div>
    </div>
  );
}
