import { createAuthClient } from "better-auth/react";
import { organizationClient, apiKeyClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [organizationClient(), apiKeyClient()],
});

export const { signIn, signUp, signOut, useSession, organization } =
  authClient;
