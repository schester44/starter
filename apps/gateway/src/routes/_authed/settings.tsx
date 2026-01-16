import { useState } from "react";
import { createFileRoute, Outlet, Link, useLocation } from "@tanstack/react-router";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { User, Building2, Key, ChevronDown, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/settings")({
  component: SettingsLayout,
});

function SettingsLayout() {
  const location = useLocation();
  const [orgExpanded, setOrgExpanded] = useState(true);

  return (
    <div className="flex flex-col h-full">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="font-semibold">Settings</h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <nav className="w-48 shrink-0 border-r p-4">
          <ul className="space-y-1">
            <li>
              <Link
                to="/settings/account"
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  location.pathname === "/settings/account"
                    ? "bg-muted font-medium"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <User className="h-4 w-4" />
                Account
              </Link>
            </li>
            <li>
              <button
                onClick={() => setOrgExpanded(!orgExpanded)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              >
                <Building2 className="h-4 w-4" />
                Organization
                <ChevronDown
                  className={cn(
                    "ml-auto h-4 w-4 transition-transform",
                    orgExpanded && "rotate-180"
                  )}
                />
              </button>
              {orgExpanded && (
                <ul className="ml-4 mt-1 space-y-1 border-l pl-2">
                  <li>
                    <Link
                      to="/settings/team"
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                        location.pathname === "/settings/team"
                          ? "bg-muted font-medium"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      <Users className="h-4 w-4" />
                      Team
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/settings/api-keys"
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                        location.pathname === "/settings/api-keys"
                          ? "bg-muted font-medium"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      <Key className="h-4 w-4" />
                      API Keys
                    </Link>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </nav>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
