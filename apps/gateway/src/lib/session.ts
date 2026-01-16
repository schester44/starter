import { auth } from "@/lib/auth";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

export const getSessionFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders();

    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      return null;
    }

    // Get user's organizations
    const orgs = await auth.api.listOrganizations({ headers });

    // Get active organization if set
    let activeOrg = null;
    if (session.session.activeOrganizationId) {
      activeOrg = await auth.api.getFullOrganization({
        headers,
        query: { organizationId: session.session.activeOrganizationId },
      });
    }

    return {
      user: session.user,
      session: session.session,
      organizations: orgs ?? [],
      activeOrganization: activeOrg,
    };
  }
);
