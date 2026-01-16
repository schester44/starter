import * as React from "react";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getSessionFn } from "@/lib/session";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { organization } from "@/lib/auth-client";

export const Route = createFileRoute("/_authed")({
  beforeLoad: async ({ location }) => {
    const session = await getSessionFn();

    if (!session) {
      throw redirect({ to: "/login" });
    }

    const { organizations, activeOrganization } = session;

    // If user has no organizations, redirect to onboarding (unless already there)
    if (organizations.length === 0 && location.pathname !== "/onboarding") {
      throw redirect({ to: "/onboarding" });
    }

    // If user has orgs but none is active, we'll handle this in the component
    // by auto-selecting the first one

    return {
      session,
      organizations,
      activeOrganization,
      needsOrgSelection: organizations.length > 0 && !activeOrganization,
    };
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  const { session, organizations, activeOrganization, needsOrgSelection } = Route.useRouteContext();

  // If we need to select an org, show a loading state while we auto-select
  if (needsOrgSelection) {
    return <OrgAutoSelector />;
  }

  return (
    <SidebarProvider>
      <AppSidebar
        user={session.user}
        organizations={organizations}
        activeOrganization={activeOrganization}
      />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}

function OrgAutoSelector() {
  const { organizations } = Route.useRouteContext();

  // Auto-select the first organization
  React.useEffect(() => {
    const firstOrg = organizations[0];
    if (firstOrg) {
      organization.setActive({ organizationId: firstOrg.id }).then(() => {
        window.location.reload();
      });
    }
  }, [organizations]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Setting up your workspace...</p>
      </div>
    </div>
  );
}
