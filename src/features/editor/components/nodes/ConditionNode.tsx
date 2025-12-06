import { memo } from "react"
import { Handle, Position } from "@xyflow/react"
import { GitBranch } from "lucide-react"
import { NodeStatusBadge, type NodeStatus } from "./NodeStatusBadge"
import type { ConditionalLogic } from "@/types/schema"
import { ConditionOperator as ConditionOperatorEnum } from "@/types/schema"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
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
      <Card 
        className={cn(
          "w-48 border-2 transition-all duration-300",
          isSelected ? "border-amber-500 shadow-lg ring-1 ring-amber-500" : "hover:border-amber-500/50"
        )}
        onClick={onSelect}
      >
        <CardHeader className="flex flex-row items-center space-y-0 p-3 gap-3 justify-center">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <GitBranch className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <CardTitle className="text-sm font-medium leading-none">
              Condition
            </CardTitle>
            <span className="text-xs text-muted-foreground font-mono mt-1">
              {operatorText}
            </span>
          </div>
          <NodeStatusBadge status={status} color="" />
        </CardHeader>
        
        {/* Handles */}
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={true}
          className="w-3 h-3 !bg-muted-foreground !border-2 !border-background"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={true}
          className="w-3 h-3 !bg-muted-foreground !border-2 !border-background"
        />
      </Card>
    </div>
  )
})

ConditionNode.displayName = "ConditionNode"
