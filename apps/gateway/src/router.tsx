import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createTanStackRouter({
    routeTree,
    defaultPreload: "intent",
    scrollRestorationBehavior: "auto",
    scrollRestoration: true,
    defaultErrorComponent: ({ error }) => (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-destructive">Error</h1>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
      </div>
    ),
    defaultNotFoundComponent: () => (
      <div className="p-4">
        <h1 className="text-2xl font-bold">Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
      </div>
    ),
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
