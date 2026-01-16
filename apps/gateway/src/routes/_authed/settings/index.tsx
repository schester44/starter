import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authed/settings/")({
  component: SettingsIndexPage,
});

function SettingsIndexPage() {
  const { session } = useRouteContext({ from: "/_authed" });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">General Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and organization settings
        </p>
      </div>

      {/* Profile Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Your Profile</h2>
        <div className="rounded-lg border p-6 max-w-lg">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="font-medium">{session.user.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="font-medium">{session.user.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
        <div className="rounded-lg border border-destructive/50 p-6 max-w-lg">
          <p className="text-sm text-muted-foreground mb-4">
            Permanently delete your account and all associated data. This action
            cannot be undone.
          </p>
          <Button variant="destructive">Delete Account</Button>
        </div>
      </div>
    </div>
  );
}
