import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react"

export type NodeStatus = "success" | "warning" | "error" | "normal"

interface NodeStatusBadgeProps {
  status: NodeStatus
  color: string
}

export function NodeStatusBadge({ status }: NodeStatusBadgeProps) {
  if (status === "normal") return null

  const getBadgeColor = () => {
    switch (status) {
      case "success":
        return "bg-green-500"
      case "warning":
        return "bg-yellow-500"
      case "error":
        return "bg-red-500"
      default:
        return ""
    }
  }


  return (
    <div className="absolute -top-2 -right-2 z-20" style={{ pointerEvents: 'none' }}>
      {/* Status icon - no outer boundary */}
      <div className={`w-8 h-8 rounded-full ${getBadgeColor()} flex items-center justify-center shadow-lg`}>
        {status === "success" && <CheckCircle2 className="h-6 w-6 text-white" />}
        {status === "warning" && <AlertTriangle className="h-6 w-6 text-white" />}
        {status === "error" && <XCircle className="h-6 w-6 text-white" />}
      </div>
    </div>
  )
}

