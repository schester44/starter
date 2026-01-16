import { useState } from "react";
import { organization } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Building2, ChevronsUpDown, Plus, Check } from "lucide-react";

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
}

interface OrgSwitcherProps {
  organizations: Organization[];
  activeOrganization: Organization | null;
}

export function OrgSwitcher({ organizations, activeOrganization }: OrgSwitcherProps) {
  const { isMobile } = useSidebar();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgSlug, setNewOrgSlug] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const handleSwitchOrg = async (orgId: string) => {
    if (orgId === activeOrganization?.id) return;
    setIsSwitching(true);
    await organization.setActive({ organizationId: orgId });
    window.location.reload();
  };

  const handleCreateOrg = async () => {
    if (!newOrgName || !newOrgSlug) return;

    setIsCreating(true);
    try {
      const result = await organization.create({
        name: newOrgName,
        slug: newOrgSlug,
      });

      if (result.data) {
        await organization.setActive({ organizationId: result.data.id });
        setCreateDialogOpen(false);
        setNewOrgName("");
        setNewOrgSlug("");
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to create organization:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                disabled={isSwitching}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Building2 className="h-4 w-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {activeOrganization?.name ?? "No Organization"}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {activeOrganization?.slug ?? "Select an organization"}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Organizations
              </DropdownMenuLabel>
              {organizations.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => handleSwitchOrg(org.id)}
                  className="gap-2 p-2 cursor-pointer"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-sm border">
                    <Building2 className="h-4 w-4 shrink-0" />
                  </div>
                  <span className="flex-1">{org.name}</span>
                  {activeOrganization?.id === org.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 p-2 cursor-pointer"
                onClick={() => setCreateDialogOpen(true)}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-md border bg-background">
                  <Plus className="h-4 w-4" />
                </div>
                <span className="text-muted-foreground">Create Organization</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
            <DialogDescription>
              Create a new organization to collaborate with your team.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Organization Name
              </label>
              <Input
                id="name"
                placeholder="Acme Inc."
                value={newOrgName}
                onChange={(e) => {
                  setNewOrgName(e.target.value);
                  setNewOrgSlug(generateSlug(e.target.value));
                }}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="slug" className="text-sm font-medium">
                URL Slug
              </label>
              <Input
                id="slug"
                placeholder="acme-inc"
                value={newOrgSlug}
                onChange={(e) => setNewOrgSlug(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This will be used in URLs: /org/{newOrgSlug || "your-slug"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateOrg}
              disabled={!newOrgName || !newOrgSlug || isCreating}
            >
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
