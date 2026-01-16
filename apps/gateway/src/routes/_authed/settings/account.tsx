import { useState } from "react";
import { createFileRoute, useRouteContext, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_authed/settings/account")({
  component: AccountPage,
});

function AccountPage() {
  const { session } = useRouteContext({ from: "/_authed" });
  const router = useRouter();
  const [name, setName] = useState(session.user.name);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await authClient.updateUser({ name });
      // Invalidate the route to refresh session data
      await router.invalidate();
    } catch (error) {
      console.error("Failed to update name:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = name !== session.user.name;

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Account</h2>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-medium mb-4">Profile</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={session.user.email} disabled />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
