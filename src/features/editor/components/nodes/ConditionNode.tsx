import { memo } from "react"
import { Handle, Position } from "@xyflow/react"
import { GitBranch } from "lucide-react"
import { NodeStatusBadge, type NodeStatus } from "./NodeStatusBadge"
import type { ConditionalLogic } from "@/types/schema"
import { ConditionOperator as ConditionOperatorEnum } from "@/types/schema"
import { cn } from "@/lib/utils"

export interface ConditionNodeData {
  condition: ConditionalLogic
  stepName?: string
  onSelect?: () => void
  status?: NodeStatus
  selected?: boolean
}

interface ConditionNodeProps {
  data: ConditionNodeData
  selected?: boolean
}

export const ConditionNode = memo(({ data, selected: reactFlowSelected }: ConditionNodeProps) => {
  const { condition, onSelect, status = "normal", selected = false } = data
  const operatorText = condition.operator === ConditionOperatorEnum.AND ? "AND" : "OR"
  const isSelected = selected || reactFlowSelected

  return (
    <div className="relative group">
      <div 
        className={cn(
          "w-48 rounded-xl bg-card transition-all duration-200 cursor-pointer",
          "border-2 shadow-md hover:shadow-lg",
          isSelected 
            ? "border-primary shadow-lg ring-2 ring-primary/20" 
            : "border-node-border hover:border-node-border-hover"
        )}
        onClick={onSelect}
      >
        <div className="flex items-center p-3 gap-3 justify-center">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
            <GitBranch className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-semibold leading-none">
              Condition
            </p>
            <span className="text-[11px] text-muted-foreground font-mono mt-1">
              {operatorText}
            </span>
          </div>
          <NodeStatusBadge status={status} color="" />
        </div>
      </div>
      
      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={true}
        className="!w-3 !h-3 !bg-primary !border-2 !border-card"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={true}
        className="!w-3 !h-3 !bg-primary !border-2 !border-card"
      />
    </div>
  )
})

ConditionNode.displayName = "ConditionNode"
