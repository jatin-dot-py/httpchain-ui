import { AlertTriangle } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog"

interface DeleteAllChainsDialogProps {
  open: boolean
  count: number
  onConfirm: () => void
  onCancel: () => void
  isPending: boolean
}

export function DeleteAllChainsDialog({ open, count, onConfirm, onCancel, isPending }: DeleteAllChainsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Delete All Chains
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-3">
            Are you sure you want to delete <span className="font-semibold text-foreground">all {count} chains</span>?
          </p>
          <p className="text-sm text-destructive font-medium">
            This action cannot be undone and will permanently delete all workflow chains.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending ? "Deleting..." : "Delete All"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

