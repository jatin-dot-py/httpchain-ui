import { useEffect } from 'react'
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, BackgroundVariant } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useAppStore } from "@/store"
import { nodeTypes } from "../nodes"
import { useWorkflowFlow } from "../../hooks/useWorkflowFlow"

export function FlowCanvas() {
  const theme = useAppStore(s => s.theme)
  const { nodes: initialNodes, edges: initialEdges } = useWorkflowFlow()
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  
  // Update nodes and edges when workflow changes
  useEffect(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [initialNodes, initialEdges, setNodes, setEdges])
  
  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        fitView
        colorMode={theme}
        className="bg-background"
      >
        <Background 
          variant={BackgroundVariant.Lines} 
          gap={24} 
          size={1} 
          className="opacity-[0.15]"
        />
        <Controls />
        <MiniMap nodeColor={(node) => {
          if (node.type === "inputVariable") return "green"
          if (node.type === "step") return "blue"
          if (node.type === "extractor") return "green"
          if (node.type === "condition") return "yellow"
          return "gray"
        }} />
      </ReactFlow>
    </div>
  )
}

