import { memo } from "react"
import { Handle, Position } from "@xyflow/react"
import { Variable } from "lucide-react"
import { NodeStatusBadge, type NodeStatus } from "./NodeStatusBadge"

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
  const borderColor = "#4ECDC4" // Teal/Cyan - represents data entry, fresh start
  const isSelected = selected || reactFlowSelected

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative border-2 w-16 h-16 cursor-pointer transition-all flex items-center justify-center ${
          isSelected
            ? "shadow-xl scale-110"
            : "hover:shadow-lg"
        }`}
        style={{
          borderRadius: '50%',
          borderColor: borderColor,
          background: 'radial-gradient(circle, rgba(78, 205, 196, 0.15) 0%, rgba(62, 164, 157, 0.1) 100%)',
          backdropFilter: 'blur(8px)',
          boxShadow: isSelected 
            ? `0 0 0 3px ${borderColor}40, 0 0 20px ${borderColor}30, 0 0 40px ${borderColor}20`
            : undefined,
        }}
        onClick={onSelect}
      >
        <Variable className="h-9 w-9 shrink-0" style={{ color: borderColor }} />
        
        <NodeStatusBadge status={status} color={borderColor} />

        {/* Handles - Only East pole */}
        <Handle
          type="source"
          position={Position.Right}
          isConnectable={true}
          className="w-3.5 h-3.5 !border-2 !border-white dark:!border-gray-900"
          style={{ right: -6, backgroundColor: borderColor }}
        />
      </div>
      <div className="mt-2 text-xs font-medium text-foreground font-mono text-center max-w-[120px] truncate">
        {variableName}
      </div>
    </div>
  )
})

InputVariableNode.displayName = "InputVariableNode"

