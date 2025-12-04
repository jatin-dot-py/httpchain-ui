import { AlertTriangle } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog"

interface DeleteChainDialogProps {
  chainId: string | null
  onConfirm: (id: string) => void
  onCancel: () => void
  isPending: boolean
}

export function DeleteChainDialog({ chainId, onConfirm, onCancel, isPending }: DeleteChainDialogProps) {
  return (
    <Dialog open={chainId !== null} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Delete Chain
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this chain? This action cannot be undone.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button 
            variant="destructive" 
            onClick={() => chainId !== null && onConfirm(chainId)}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

