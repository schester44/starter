import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { z } from "zod";
import { authClient, useSession, signIn, signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@flightplan/db";
import { Loader2 } from "lucide-react";

const getInvitationDetails = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      invitationId: z.string(),
    })
  )
  .handler(async ({ data }) => {
    const invitation = await db.invitation.findFirst({
      where: {
        id: data.invitationId,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        organization: true,
      },
    });

    return invitation;
  });

export const Route = createFileRoute("/accept-invitation/$id")({
  loader: async ({ params }) => {
    const invitation = await getInvitationDetails({
      data: {
        invitationId: params.id,
      },
    });

    return { invitation };
  },
  component: AcceptInvitationPage,
});

function AcceptInvitationPage() {
  const { invitation } = Route.useLoaderData();
  const { id: invitationId } = Route.useParams();
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();

  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth form state
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState(invitation?.email || "");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Auto-accept when user is logged in
  useEffect(() => {
    if (!session?.user || isAccepting) return;

    async function autoAccept() {
      setIsAccepting(true);
      setError(null);

      try {
        const result = await authClient.organization.acceptInvitation({
          invitationId,
        });

        if (result.data) {
          navigate({ to: "/dashboard" });
        } else {
          if (result.error?.code === "INVITATION_NOT_FOUND") {
            navigate({ to: "/dashboard" });
            return;
          }
          setError(result.error?.message || "Failed to accept invitation");
        }
      } catch (err) {
        console.error("Error accepting invitation:", err);
        setError("An unexpected error occurred");
      } finally {
        setIsAccepting(false);
      }
    }

    autoAccept();
  }, [session, invitationId, navigate, isAccepting]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAuthLoading(true);

    try {
      if (isSignUp) {
        const result = await signUp.email({
          email,
          password,
          name,
          callbackURL: `/accept-invitation/${invitationId}`,
        });
        if (result.error) {
          setError(result.error.message || "Sign up failed");
          return;
        }
      } else {
        const result = await signIn.email({
          email,
          password,
          callbackURL: `/accept-invitation/${invitationId}`,
        });
        if (result.error) {
          setError(result.error.message || "Sign in failed");
          return;
        }
      }
      // The useEffect will handle accepting after login
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: "github" | "google") => {
    setError(null);
    await signIn.social({
      provider,
      callbackURL: `/accept-invitation/${invitationId}`,
    });
  };

  // Loading state
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Invalid/expired invitation
  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate({ to: "/login" })} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is logged in - show accepting state
  if (session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Accepting Invitation</CardTitle>
            <CardDescription>
              Joining {invitation.organization?.name}...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            {error ? (
              <div className="text-center">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={() => navigate({ to: "/dashboard" })}>
                  Go to Dashboard
                </Button>
              </div>
            ) : (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // User not logged in - show auth form
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join {invitation.organization?.name}</CardTitle>
          <CardDescription>
            You've been invited to join <strong>{invitation.organization?.name}</strong> as a{" "}
            <strong>{invitation.role}</strong>.{" "}
            {isSignUp
              ? "Create an account to accept the invitation."
              : "Sign in to accept the invitation."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignUp && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  required={isSignUp}
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
                required
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={authLoading}>
              {authLoading
                ? "Loading..."
                : isSignUp
                  ? "Create Account & Join"
                  : "Sign In & Join"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSocialSignIn("github")}
            >
              GitHub
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSocialSignIn("google")}
            >
              Google
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Need an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:underline"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
