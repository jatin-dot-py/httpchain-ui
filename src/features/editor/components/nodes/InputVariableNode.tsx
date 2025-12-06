import { memo } from "react"
import { Handle, Position } from "@xyflow/react"
import { Variable } from "lucide-react"
import { NodeStatusBadge, type NodeStatus } from "./NodeStatusBadge"
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
      <div 
        className={cn(
          "min-w-[180px] max-w-[240px] rounded-xl bg-card transition-all duration-200 cursor-pointer",
          "border-2 shadow-md hover:shadow-lg",
          isSelected 
            ? "border-primary shadow-lg ring-2 ring-primary/20" 
            : "border-node-border hover:border-node-border-hover"
        )}
        onClick={onSelect}
      >
        <div className="flex items-center p-3 gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
            <Variable className="w-4 h-4" />
          </div>
          <p className="text-sm font-medium leading-none truncate flex-1 font-mono">
            {variableName}
          </p>
          <NodeStatusBadge status={status} color="" />
        </div>
      </div>

      {/* Handle */}
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={true}
        className="!w-3 !h-3 !bg-primary !border-2 !border-card"
      />
    </div>
  )
})

InputVariableNode.displayName = "InputVariableNode"
