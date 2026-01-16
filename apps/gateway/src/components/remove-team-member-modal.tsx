import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface RemoveTeamMemberProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  memberToRemove: {
    id: string;
    name: string;
  } | null;
  isRemoving: boolean;
}

export function RemoveTeamMemberModal({
  open,
  onOpenChange,
  onConfirm,
  memberToRemove,
  isRemoving,
}: RemoveTeamMemberProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove {memberToRemove?.name} from the
            organization? They will lose access to all organization resources.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isRemoving}>
            {isRemoving ? "Removing..." : "Remove Member"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
