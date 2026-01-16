import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Users, Building2, Key, Activity } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/_authed/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { session } = useRouteContext({ from: "/_authed" });

  const stats = [
    {
      label: "Organizations",
      value: "1",
      icon: Building2,
      description: "Active organizations",
    },
    {
      label: "Team Members",
      value: "5",
      icon: Users,
      description: "Across all orgs",
    },
    {
      label: "API Keys",
      value: "3",
      icon: Key,
      description: "Active keys",
    },
    {
      label: "API Requests",
      value: "1,234",
      icon: Activity,
      description: "Last 30 days",
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="font-semibold">Dashboard</h1>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">
            Welcome back, {session.user.name}
          </h2>
          <p className="text-muted-foreground">
            Here's an overview of your account
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-lg border p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border p-6">
            <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
            <div className="grid gap-3">
              <Button variant="outline" className="justify-start">
                <Building2 className="w-4 h-4 mr-2" />
                Create Organization
              </Button>
              <Button variant="outline" className="justify-start">
                <Users className="w-4 h-4 mr-2" />
                Invite Team Member
              </Button>
              <Button variant="outline" className="justify-start">
                <Key className="w-4 h-4 mr-2" />
                Generate API Key
              </Button>
            </div>
          </div>

          <div className="rounded-lg border p-6">
            <h3 className="text-lg font-medium mb-4">Session Info</h3>
            <pre className="text-sm bg-muted p-4 rounded overflow-auto max-h-48">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
}
