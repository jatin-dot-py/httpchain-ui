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
import { Card } from "@/components/ui/card"

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
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all duration-200">
      <div className="fixed inset-y-4 right-4 w-full max-w-5xl z-50 bg-background border rounded-xl shadow-2xl flex flex-col animate-in slide-in-from-right-1/2 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/40 rounded-t-xl">
          <div className="flex items-center gap-4">
             <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Settings className="w-5 h-5" />
             </div>
             <div>
                <StepNameEditor />
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">{step.node_id}</p>
             </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 shrink-0 hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        {/* Content with Tabs */}
        <Tabs value={activeTab} onValueChange={setSelectedStepTab} className="flex-1 flex min-h-0">
          {/* Vertical First-Level Tabs */}
          <div className="border-r bg-muted/30 w-64 shrink-0 flex flex-col p-2">
            <TabsList className="flex-col h-auto w-full bg-transparent rounded-none border-0 gap-1 items-start justify-start p-0">
              <div className="text-xs font-semibold text-muted-foreground px-4 py-2 uppercase tracking-wider">
                Configuration
              </div>
              <TabsTrigger 
                value="request" 
                className="w-full justify-start rounded-md px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:hover:bg-muted"
              >
                <Send className="h-4 w-4 mr-3" />
                Request Details
              </TabsTrigger>
              <TabsTrigger 
                value="extractors" 
                className="w-full justify-start rounded-md px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:hover:bg-muted"
              >
                <Filter className="h-4 w-4 mr-3" />
                Data Extraction
                {step?.request.extractors && step.request.extractors.length > 0 && (
                  <span className="ml-auto text-xs bg-primary-foreground/20 px-1.5 py-0.5 rounded-full">
                    {step.request.extractors.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="condition" 
                className="w-full justify-start rounded-md px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:hover:bg-muted"
              >
                <GitBranch className="h-4 w-4 mr-3" />
                Conditions
                {step?.condition && (
                  <span className="ml-auto text-xs bg-primary-foreground/20 px-1.5 py-0.5 rounded-full">
                    {step.condition.checks.length}
                  </span>
                )}
              </TabsTrigger>
              
              <Separator className="my-2" />
              
              <div className="text-xs font-semibold text-muted-foreground px-4 py-2 uppercase tracking-wider">
                Output
              </div>
              <TabsTrigger 
                value="response" 
                className="w-full justify-start rounded-md px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:hover:bg-muted"
              >
                <Download className="h-4 w-4 mr-3" />
                View Response
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-background rounded-br-xl">
            <ScrollArea className="flex-1">
              <div className="p-8 max-w-4xl mx-auto w-full">
              {/* Request Tab with Nested Horizontal Tabs */}
              <TabsContent value="request" className="mt-0 outline-none">
                <Tabs defaultValue="general" className="w-full space-y-6">
                  <div className="border-b">
                    <TabsList className="bg-transparent h-auto p-0 w-full justify-start rounded-none gap-6">
                      <TabsTrigger value="general" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-1 py-3 hover:text-foreground/80 transition-colors">
                        <Settings className="h-3.5 w-3.5 mr-2" />
                        General
                      </TabsTrigger>
                      <TabsTrigger value="headers" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-1 py-3 hover:text-foreground/80 transition-colors">
                        <FileText className="h-3.5 w-3.5 mr-2" />
                        Headers
                      </TabsTrigger>
                      <TabsTrigger value="cookies" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-1 py-3 hover:text-foreground/80 transition-colors">
                        <Cookie className="h-3.5 w-3.5 mr-2" />
                        Cookies
                      </TabsTrigger>
                      <TabsTrigger value="params" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-1 py-3 hover:text-foreground/80 transition-colors">
                        <Hash className="h-3.5 w-3.5 mr-2" />
                        Params
                      </TabsTrigger>
                      <TabsTrigger value="json" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-1 py-3 hover:text-foreground/80 transition-colors">
                        <Braces className="h-3.5 w-3.5 mr-2" />
                        Body (JSON)
                      </TabsTrigger>
                      <TabsTrigger value="data" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-1 py-3 hover:text-foreground/80 transition-colors">
                        <FormInput className="h-3.5 w-3.5 mr-2" />
                        Body (Form)
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="mt-6">
                    <TabsContent value="general" className="mt-0 outline-none">
                      <Card className="p-6">
                         <RequestBasicInfo />
                      </Card>
                      
                      <div className="mt-8 space-y-8">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b">
                            <Link2 className="h-4 w-4 text-primary" />
                            <h3 className="text-sm font-semibold">Step Dependencies</h3>
                          </div>
                          <div className="pl-2">
                             <StepDependencies />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <div className="flex items-center gap-2 pb-2 border-b">
                                <Clock className="h-4 w-4 text-primary" />
                                <h3 className="text-sm font-semibold">Timeouts & Retries</h3>
                              </div>
                              <div className="pl-2">
                                <TimeoutsRetries />
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="flex items-center gap-2 pb-2 border-b">
                                <ToggleLeft className="h-4 w-4 text-primary" />
                                <h3 className="text-sm font-semibold">Request Options</h3>
                              </div>
                              <div className="pl-2">
                                <RequestOptions />
                              </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b">
                            <Globe className="h-4 w-4 text-primary" />
                            <h3 className="text-sm font-semibold">Proxy Settings</h3>
                          </div>
                          <div className="pl-2">
                            <ProxySettings />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="headers" className="mt-0 outline-none">
                      <Card className="p-6">
                        <HeadersEditor />
                      </Card>
                    </TabsContent>

                    <TabsContent value="cookies" className="mt-0 outline-none">
                      <Card className="p-6">
                        <CookiesEditor />
                      </Card>
                    </TabsContent>

                    <TabsContent value="params" className="mt-0 outline-none">
                      <Card className="p-6">
                        <ParamsEditor />
                      </Card>
                    </TabsContent>

                    <TabsContent value="json" className="mt-0 outline-none">
                      <Card className="p-6 h-[500px] flex flex-col">
                        <JSONBodyEditor />
                      </Card>
                    </TabsContent>

                    <TabsContent value="data" className="mt-0 outline-none">
                       <Card className="p-6">
                         <FormDataEditor />
                       </Card>
                    </TabsContent>
                  </div>
                </Tabs>
              </TabsContent>

              {/* Extractors Tab */}
              <TabsContent value="extractors" className="mt-0 outline-none">
                <Card className="p-6">
                   <ExtractorsEditor />
                </Card>
              </TabsContent>

              {/* Condition Tab */}
              <TabsContent value="condition" className="mt-0 outline-none">
                <Card className="p-6">
                  <ConditionsEditor />
                </Card>
              </TabsContent>

              {/* Response Tab */}
              <TabsContent value="response" className="mt-0 outline-none">
                <Card className="flex items-center justify-center p-12 border-dashed">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Download className="h-8 w-8 opacity-50" />
                    <p className="font-medium">Response View</p>
                    <p className="text-xs">Response data will be available here after execution.</p>
                  </div>
                </Card>
              </TabsContent>
              </div>
            </ScrollArea>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
