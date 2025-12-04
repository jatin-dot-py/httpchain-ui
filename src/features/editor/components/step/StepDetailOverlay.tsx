import { 
  X, 
  Send, 
  Filter, 
  GitBranch, 
  Settings, 
  FileText, 
  Cookie, 
  Hash, 
  Braces, 
  FormInput,
  Link2,
  Clock,
  ToggleLeft,
  Globe,
  Download
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useAppStore } from "@/store"
import { useActiveStep } from "@/features/editor/hooks/useActiveStep"
import { StepNameEditor } from "./StepNameEditor"
import { RequestBasicInfo } from "./request/RequestBasicInfo"
import { StepDependencies } from "./request/StepDependencies"
import { TimeoutsRetries } from "./request/TimeoutsRetries"
import { RequestOptions } from "./request/RequestOptions"
import { ProxySettings } from "./request/ProxySettings"
import { HeadersEditor } from "./request/HeadersEditor"
import { CookiesEditor } from "./request/CookiesEditor"
import { ParamsEditor } from "./request/ParamsEditor"
import { JSONBodyEditor } from "./request/JSONBodyEditor"
import { FormDataEditor } from "./request/FormDataEditor"
import { ExtractorsEditor } from "./extractors/ExtractorsEditor"
import { ConditionsEditor } from "./conditions/ConditionsEditor"

interface StepDetailOverlayProps {
  open: boolean
  onClose: () => void
}

export function StepDetailOverlay({ open, onClose }: StepDetailOverlayProps) {
  const selectedStepTab = useAppStore(s => s.selectedStepTab)
  const setSelectedStepTab = useAppStore(s => s.setSelectedStepTab)
  const selectedStepNodeId = useAppStore(s => s.selectedStepNodeId)
  
  const step = useActiveStep()
  
  // Determine the active tab: use selectedStepTab if set, otherwise default to "request"
  const activeTab = selectedStepTab || "request"

  if (!open || !selectedStepNodeId || !step) return null

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-4 md:inset-8 lg:inset-12 xl:inset-16 z-50 bg-background border shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
          <StepNameEditor />
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 shrink-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        {/* Content with Tabs */}
        <Tabs value={activeTab} onValueChange={setSelectedStepTab} className="flex-1 flex min-h-0">
          {/* Vertical First-Level Tabs */}
          <div className="border-r bg-muted/30 w-56 shrink-0 flex flex-col">
            <TabsList className="flex-col h-auto w-full bg-transparent rounded-none border-0 p-3 gap-2 items-start justify-start">
              <TabsTrigger 
                value="request" 
                className="w-full justify-start rounded-lg px-4 py-3 text-base transition-all data-[state=active]:bg-blue-500/10 data-[state=active]:font-semibold data-[state=inactive]:hover:bg-muted/50"
              >
                <Send className="h-5 w-5 mr-3" />
                <span className="font-medium">Request</span>
              </TabsTrigger>
              <TabsTrigger 
                value="extractors" 
                className="w-full justify-start rounded-lg px-4 py-3 text-base transition-all data-[state=active]:bg-blue-500/10 data-[state=active]:font-semibold data-[state=inactive]:hover:bg-muted/50"
              >
                <Filter className="h-5 w-5 mr-3" />
                <span className="font-medium">Extractors</span>
                {step?.request.extractors && step.request.extractors.length > 0 && (
                  <span className="ml-auto text-xs text-muted-foreground font-normal">
                    ({step.request.extractors.length})
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="condition" 
                className="w-full justify-start rounded-lg px-4 py-3 text-base transition-all data-[state=active]:bg-blue-500/10 data-[state=active]:font-semibold data-[state=inactive]:hover:bg-muted/50"
              >
                <GitBranch className="h-5 w-5 mr-3" />
                <span className="font-medium">Conditions</span>
                {step?.condition && (
                  <span className="ml-auto text-xs text-muted-foreground font-normal">
                    ({step.condition.checks.length})
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="response" 
                className="w-full justify-start rounded-lg px-4 py-3 text-base transition-all data-[state=active]:bg-blue-500/10 data-[state=active]:font-semibold data-[state=inactive]:hover:bg-muted/50"
              >
                <Download className="h-5 w-5 mr-3" />
                <span className="font-medium">Response</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <ScrollArea className="flex-1">
              <div className="p-6">
              {/* Request Tab with Nested Horizontal Tabs */}
              <TabsContent value="request" className="mt-0">
                <Tabs defaultValue="general" className="w-full">
                  <div className="border-b mb-6">
                    <TabsList className="bg-transparent h-auto p-0 w-full justify-start rounded-none">
                      <TabsTrigger value="general" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">
                        <Settings className="h-3.5 w-3.5 mr-1.5" />
                        General
                      </TabsTrigger>
                      <TabsTrigger value="headers" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">
                        <FileText className="h-3.5 w-3.5 mr-1.5" />
                        Headers
                      </TabsTrigger>
                      <TabsTrigger value="cookies" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">
                        <Cookie className="h-3.5 w-3.5 mr-1.5" />
                        Cookies
                      </TabsTrigger>
                      <TabsTrigger value="params" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">
                        <Hash className="h-3.5 w-3.5 mr-1.5" />
                        Params
                      </TabsTrigger>
                      <TabsTrigger value="json" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">
                        <Braces className="h-3.5 w-3.5 mr-1.5" />
                        Body (JSON)
                      </TabsTrigger>
                      <TabsTrigger value="data" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">
                        <FormInput className="h-3.5 w-3.5 mr-1.5" />
                        Body (Form)
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div>
                    <TabsContent value="general" className="mt-0">
                      <RequestBasicInfo />
                      
                      <div className="mt-6 space-y-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Link2 className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-medium">Step Dependencies</h3>
                          </div>
                          <StepDependencies />
                        </div>

                        <Separator />

                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-medium">Timeouts & Retries</h3>
                          </div>
                          <TimeoutsRetries />
                        </div>

                        <Separator />

                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-medium">Request Options</h3>
                          </div>
                          <RequestOptions />
                        </div>

                        <Separator />

                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-medium">Proxy Settings</h3>
                          </div>
                          <ProxySettings />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="headers" className="mt-0">
                      <HeadersEditor />
                    </TabsContent>

                    <TabsContent value="cookies" className="mt-0">
                      <CookiesEditor />
                    </TabsContent>

                    <TabsContent value="params" className="mt-0">
                      <ParamsEditor />
                    </TabsContent>

                    <TabsContent value="json" className="mt-0">
                      <JSONBodyEditor />
                    </TabsContent>

                    <TabsContent value="data" className="mt-0">
                      <FormDataEditor />
                    </TabsContent>
                  </div>
                </Tabs>
              </TabsContent>

              {/* Extractors Tab */}
              <TabsContent value="extractors" className="mt-0">
                <ExtractorsEditor />
              </TabsContent>

              {/* Condition Tab */}
              <TabsContent value="condition" className="mt-0">
                <ConditionsEditor />
              </TabsContent>

              {/* Response Tab */}
              <TabsContent value="response" className="mt-0">
                <div className="text-sm text-muted-foreground text-center py-8 border border-dashed rounded-lg">
                  Response editor coming soon...
                </div>
              </TabsContent>
              </div>
            </ScrollArea>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
