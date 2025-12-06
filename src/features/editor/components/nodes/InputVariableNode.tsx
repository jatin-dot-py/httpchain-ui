import { memo } from "react"
import { Handle, Position } from "@xyflow/react"
import { Variable } from "lucide-react"
import { NodeStatusBadge, type NodeStatus } from "./NodeStatusBadge"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface InputVariableNodeData {
  variableName: string
  onSelect?: () => void
  status?: NodeStatus
  selected?: boolean
}

interface InputVariableNodeProps {
  data: InputVariableNodeData
  selected?: boolean
}

export const InputVariableNode = memo(({ data, selected: reactFlowSelected }: InputVariableNodeProps) => {
  const { variableName, onSelect, status = "normal", selected = false } = data
  const isSelected = selected || reactFlowSelected

  return (
    <div className="relative group">
      <Card 
        className={cn(
          "min-w-[180px] max-w-[240px] border-2 transition-all duration-300",
          isSelected ? "border-green-500 shadow-lg ring-1 ring-green-500" : "hover:border-green-500/50"
        )}
        onClick={onSelect}
      >
        <CardHeader className="flex flex-row items-center space-y-0 p-3 gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
            <Variable className="w-4 h-4" />
          </div>
          <CardTitle className="text-sm font-medium leading-none truncate flex-1 font-mono">
            {variableName}
          </CardTitle>
          <NodeStatusBadge status={status} color="" />
        </CardHeader>

        {/* Handles */}
        <Handle
          type="source"
          position={Position.Right}
          isConnectable={true}
          className="w-3 h-3 !bg-muted-foreground !border-2 !border-background"
        />
      </Card>
    </div>
  )
})

InputVariableNode.displayName = "InputVariableNode"
