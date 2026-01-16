import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { AddTeamMemberModal, type Role } from "@/components/add-team-member-modal";
import { RemoveTeamMemberModal } from "@/components/remove-team-member-modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Plus, Mail, Shield, MoreHorizontal, Trash2, Clock } from "lucide-react";
import { useState } from "react";
import { auth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Server function to get organization members
const getTeamMembers = createServerFn({ method: "GET" }).handler(async () => {
  const session = await auth.api.getSession({
    headers: getRequestHeaders(),
  });

  if (!session?.session.activeOrganizationId) {
    return { members: [], invitations: [], currentUserId: session?.user.id };
  }

  const fullOrg = await auth.api.getFullOrganization({
    headers: getRequestHeaders(),
  });

  const invitations = await auth.api.listInvitations({
    headers: getRequestHeaders(),
    query: {
      organizationId: session.session.activeOrganizationId,
    },
  });

  return {
    members: fullOrg?.members || [],
    invitations: invitations?.filter((inv) => inv.status === "pending") || [],
    currentUserId: session?.user.id,
  };
});

// Server function to invite team members
const inviteTeamMember = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    email: z.string().email(),
    role: z.enum(["owner", "admin", "member"]),
  }))
  .handler(async ({ data }) => {
    await auth.api.createInvitation({
      headers: getRequestHeaders(),
      body: {
        email: data.email,
        role: data.role,
        resend: true,
      },
    });

    return { success: true };
  });

// Server function to remove a member
const removeMember = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    memberIdOrEmail: z.string(),
  }))
  .handler(async ({ data }) => {
    await auth.api.removeMember({
      headers: getRequestHeaders(),
      body: {
        memberIdOrEmail: data.memberIdOrEmail,
      },
    });

    return { success: true };
  });

// Server function to cancel an invitation
const cancelInvitation = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    invitationId: z.string(),
  }))
  .handler(async ({ data }) => {
    await auth.api.cancelInvitation({
      headers: getRequestHeaders(),
      body: {
        invitationId: data.invitationId,
      },
    });

    return { success: true };
  });

export const Route = createFileRoute("/_authed/settings/team")({
  component: TeamPage,
  loader: async () => {
    return await getTeamMembers();
  },
});

function TeamPage() {
  const data = Route.useLoaderData();
  const router = useRouter();

  // Add Member Modal state
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  // Remove Member Modal state
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleAddMembers = async (emails: string[], role: Role) => {
    setIsInviting(true);
    try {
      for (const email of emails) {
        await inviteTeamMember({ data: { email, role } });
      }
      await router.invalidate();
      setAddMemberOpen(false);
    } catch (error) {
      console.error("Failed to send invites:", error);
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    setIsRemoving(true);
    try {
      await removeMember({ data: { memberIdOrEmail: memberToRemove.email } });
      await router.invalidate();
      setRemoveDialogOpen(false);
      setMemberToRemove(null);
    } catch (error) {
      console.error("Failed to remove member:", error);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await cancelInvitation({ data: { invitationId } });
      await router.invalidate();
    } catch (error) {
      console.error("Failed to cancel invitation:", error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default";
      case "admin":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team Members</h1>
          <p className="text-muted-foreground">
            Manage your organization's team members and their access
          </p>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() => setAddMemberOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Invite Member
        </Button>
      </div>

      {/* Active Members */}
      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4 py-4">Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  No team members yet. Invite someone to get started!
                </TableCell>
              </TableRow>
            ) : (
              data.members.map((member) => {
                const isCurrentUser = member.userId === data.currentUserId;
                const isOwner = member.role === "owner";

                return (
                  <TableRow key={member.id}>
                    <TableCell className="pl-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="rounded">
                          <AvatarImage
                            src={member.user.image || undefined}
                            alt={member.user.name}
                          />
                          <AvatarFallback>
                            {getInitials(member.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-foreground">
                            {member.user.name}
                            {isCurrentUser && (
                              <span className="text-xs text-muted-foreground ml-2">
                                (You)
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {member.user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <Badge variant={getRoleBadgeVariant(member.role)}>
                          {member.role}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {!isCurrentUser && !isOwner && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                setMemberToRemove({
                                  id: member.id,
                                  name: member.user.name,
                                  email: member.user.email,
                                });
                                setRemoveDialogOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pending Invitations */}
      {data.invitations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Pending Invitations</h2>
          <div className="border rounded-lg bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4 py-4">Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell className="pl-4 py-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {invitation.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(invitation.role)}>
                        {invitation.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">Pending</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleCancelInvitation(invitation.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Cancel Invitation
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <RemoveTeamMemberModal
        open={removeDialogOpen}
        onOpenChange={setRemoveDialogOpen}
        onConfirm={handleRemoveMember}
        memberToRemove={memberToRemove}
        isRemoving={isRemoving}
      />

      <AddTeamMemberModal
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
        onSubmit={handleAddMembers}
        isSubmitting={isInviting}
      />
    </div>
  );
}
