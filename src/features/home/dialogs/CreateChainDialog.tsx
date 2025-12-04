import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog"

interface CreateChainDialogProps {
  open: boolean
  name: string
  onNameChange: (name: string) => void
  onCreate: () => void
  onCancel: () => void
  isPending: boolean
}

export function CreateChainDialog({ open, name, onNameChange, onCreate, onCancel, isPending }: CreateChainDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Chain</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            value={name}
            onChange={e => onNameChange(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onCreate()}
            placeholder="Enter chain name..."
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={onCreate} disabled={!name.trim() || isPending}>
            {isPending ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

