import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization, apiKey } from "better-auth/plugins";
import { db } from "@flightplan/db";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      enabled: !!process.env.GITHUB_CLIENT_ID,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      enabled: !!process.env.GOOGLE_CLIENT_ID,
    },
  },
  plugins: [
    organization({
      async sendInvitationEmail(data) {
        const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
        const inviteLink = `${baseUrl}/accept-invitation/${data.id}`;

        // Log invite link for local testing
        console.log(`\n🔗 Invite link for ${data.email}:`);
        console.log(`   ${inviteLink}`);
        console.log(`   Invited by: ${data.inviter.user.name} (${data.inviter.user.email})`);
        console.log(`   Organization: ${data.organization.name}`);
        console.log(`   Role: ${data.role}\n`);

        // TODO: Send actual email in production
      },
    }),
    apiKey(),
  ],
});

export type Session = typeof auth.$Infer.Session;
