import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { z } from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Key, Plus, Trash2, Copy, AlertTriangle } from "lucide-react";
import { auth } from "@/lib/auth";

// Server function to list API keys
const listApiKeys = createServerFn({ method: "GET" }).handler(async () => {
  const result = await auth.api.listApiKeys({
    headers: getRequestHeaders(),
  });

  return result || [];
});

// Server function to create API key
const createApiKey = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      name: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const result = await auth.api.createApiKey({
      headers: getRequestHeaders(),
      body: {
        name: data.name,
      },
    });

    return result;
  });

// Server function to delete API key
const deleteApiKey = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      keyId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    await auth.api.deleteApiKey({
      headers: getRequestHeaders(),
      body: {
        keyId: data.keyId,
      },
    });

    return { success: true };
  });

export const Route = createFileRoute("/_authed/settings/api-keys")({
  component: ApiKeysPage,
  loader: async () => {
    const apiKeys = await listApiKeys();

    return { apiKeys };
  },
});

function ApiKeysPage() {
  const { apiKeys } = Route.useLoaderData();
  const router = useRouter();

  // Create modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Key display modal state
  const [isKeyDisplayOpen, setIsKeyDisplayOpen] = useState(false);
  const [createdKey, setCreatedKey] = useState<{
    key: string;
    name: string;
  } | null>(null);

  // Delete state
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;

    setIsCreating(true);
    try {
      const result = await createApiKey({ data: { name: keyName } });
      setCreatedKey({ key: result.key, name: keyName });
      setKeyName("");
      setIsCreateOpen(false);
      setIsKeyDisplayOpen(true);
      await router.invalidate();
    } catch (error) {
      console.error("Failed to create API key:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    setIsDeletingId(keyId);
    try {
      await deleteApiKey({ data: { keyId } });
      await router.invalidate();
    } catch (error) {
      console.error("Failed to delete API key:", error);
    } finally {
      setIsDeletingId(null);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">API Keys</h1>
          <p className="text-muted-foreground">
            Create and manage API keys to access the API programmatically
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>
                Create a new API key to access the API programmatically
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateKey}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="key-name">Name</Label>
                  <Input
                    id="key-name"
                    placeholder="Production API Key"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    A friendly name to identify this API key
                  </p>
                </div>
                <div className="rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950 p-4">
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    A new API key will be generated immediately. Make sure to
                    copy and store it securely as you won't be able to see it
                    again.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating || !keyName.trim()}>
                  {isCreating ? "Creating..." : "Create API Key"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* API Key Display Modal */}
      <Dialog open={isKeyDisplayOpen} onOpenChange={setIsKeyDisplayOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              Your New API Key
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div className="text-amber-800 dark:text-amber-200 text-sm">
                  <strong>Important:</strong> This is the only time your API key
                  will be shown. Store it securely as you won't be able to see
                  it again.
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={createdKey?.key || ""}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => createdKey && copyToClipboard(createdKey.key)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Use this key in your API requests by including it in the
                Authorization header
              </p>
            </div>

            <DialogFooter>
              <Button
                onClick={() => {
                  setIsKeyDisplayOpen(false);
                  setCreatedKey(null);
                }}
              >
                I've Saved the API Key
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* API Keys Table */}
      <div className="border rounded-lg bg-card">
        {apiKeys.length === 0 ? (
          <div className="text-center py-12">
            <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No API keys created</p>
            <p className="text-sm text-muted-foreground">
              Create an API key to start using the API
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((apiKey) => (
                <TableRow key={apiKey.id}>
                  <TableCell className="pl-4 font-medium">
                    {apiKey.name || "Unnamed Key"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={apiKey.enabled ? "default" : "secondary"}>
                      {apiKey.enabled ? "Active" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(apiKey.createdAt)}</TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isDeletingId === apiKey.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this API key? This
                            action cannot be undone and any applications using
                            this key will lose access.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteKey(apiKey.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
