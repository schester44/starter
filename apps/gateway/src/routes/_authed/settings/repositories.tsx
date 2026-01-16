import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/settings/repositories")({
  component: RepositoriesPage,
});

function RepositoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Repositories</h1>
        <p className="text-muted-foreground">
          Connect and manage your GitHub repositories
        </p>
      </div>

      <div className="rounded-lg border p-6">
        <p className="text-muted-foreground">
          Repository management will be available here.
        </p>
      </div>
    </div>
  );
}
