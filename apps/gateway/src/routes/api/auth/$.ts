import { auth } from "@/lib/auth";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url);

        // Check if this is a GitHub callback with installation_id
        if (url.pathname.includes("/callback/github")) {
          const installationId = url.searchParams.get("installation_id");
          const setupAction = url.searchParams.get("setup_action");

          if (installationId) {
            // Get the response from better-auth first
            const response = await auth.handler(request);

            // Clone the response to modify headers
            const newHeaders = new Headers(response.headers);

            // Add cookies to store the installation info
            newHeaders.append(
              "Set-Cookie",
              `github_installation_id=${installationId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=300`
            );
            if (setupAction) {
              newHeaders.append(
                "Set-Cookie",
                `github_setup_action=${setupAction}; Path=/; HttpOnly; SameSite=Lax; Max-Age=300`
              );
            }

            return new Response(response.body, {
              status: response.status,
              statusText: response.statusText,
              headers: newHeaders,
            });
          }
        }

        return await auth.handler(request);
      },
      POST: async ({ request }: { request: Request }) => {
        return await auth.handler(request);
      },
    },
  },
});
