import { memo } from "react"
import { Handle, Position } from "@xyflow/react"
import { Variable } from "lucide-react"
import { NodeStatusBadge, type NodeStatus } from "./NodeStatusBadge"
import type { Extractor } from "@/types/schema"

export interface ExtractorNodeData {
  extractor: Extractor
  stepName?: string
  onSelect?: () => void
  status?: NodeStatus
  selected?: boolean
}

interface ExtractorNodeProps {
  data: ExtractorNodeData
  selected?: boolean
}

export const ExtractorNode = memo(({ data, selected: reactFlowSelected }: ExtractorNodeProps) => {
  const { extractor, onSelect, status = "normal", selected = false } = data
  const borderColor = "#45B26B" // Green - output/success, data extraction
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
          background: 'radial-gradient(circle, rgba(69, 178, 107, 0.15) 0%, rgba(55, 142, 86, 0.1) 100%)',
          backdropFilter: 'blur(8px)',
          boxShadow: isSelected 
            ? `0 0 0 3px ${borderColor}40, 0 0 20px ${borderColor}30, 0 0 40px ${borderColor}20`
            : undefined,
        }}
        onClick={onSelect}
      >
        <Variable className="h-9 w-9 shrink-0" style={{ color: borderColor }} />
        
        <NodeStatusBadge status={status} color={borderColor} />

        <Handle
          type="target"
          position={Position.Left}
          isConnectable={true}
          className="w-3.5 h-3.5 !border-2 !border-white dark:!border-gray-900"
          style={{ left: -6, backgroundColor: borderColor }}
        />
        <Handle
          type="source"
          position={Position.Right}
          isConnectable={true}
          className="w-3.5 h-3.5 !border-2 !border-white dark:!border-gray-900"
          style={{ right: -6, backgroundColor: borderColor }}
        />
      </div>
      <div className="mt-2 text-xs font-medium text-foreground text-center max-w-[120px] truncate">
        {extractor.extractor_key}
      </div>
    </div>
  )
})

ExtractorNode.displayName = "ExtractorNode"

