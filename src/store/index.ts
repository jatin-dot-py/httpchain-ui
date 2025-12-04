import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { HttpChain, Step } from "../types/schema"
import { updateChain } from "../services/api"
import { createEmptyStep, generateUUID } from "../types/schema"
import { toast } from "../lib/toast"

// Types
type Theme = "light" | "dark"

interface AppState {
  // Backend URL (not persisted - prompts on every refresh)
  backendUrl: string | null
  setBackendUrl: (url: string) => void
  
  // Theme
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  
  // Selected Chain
  selectedChainId: number | null
  setSelectedChainId: (id: number | null) => void
  clearSelection: () => void
  
  // Workflow
  chainId: number | null
  workflow: HttpChain | null
  chainUpdatedAt: string | null
  chainTags: string[] | null
  isLoading: boolean
  isSaving: boolean
  
  // Step Detail View
  selectedStepNodeId: string | null
  setSelectedStepNodeId: (nodeId: string | null) => void
  selectedStepTab: string | null
  setSelectedStepTab: (tab: string | null) => void
  
  // Workflow Actions
  loadWorkflow: (chainId: number, data: any, updatedAt: string, tags: string[]) => void
  addInputVariable: (variableName: string) => Promise<void>
  addStep: (step?: Partial<Step>) => Promise<void>
  updateStep: (nodeId: string, updates: Partial<Step>) => Promise<void>
  updateChainName: (name: string) => Promise<void>
  updateChainTags: (tags: string[]) => Promise<void>
  removeInputVariable: (variableName: string) => Promise<void>
  removeStep: (nodeId: string) => Promise<void>
  clearWorkflow: () => void
}

async function saveWorkflowToDb(chainId: number, workflow: HttpChain) {
  return await updateChain(chainId, {
    name: workflow.name,
    steps: workflow.steps,
    chain_variables: workflow.chain_variables,
  })
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light"
  
  const saved = localStorage.getItem("theme") as Theme | null
  if (saved === "dark" || saved === "light") return saved
  
  // Auto-detect system preference
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark"
  }
  return "light"
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Backend URL state (not persisted - resets on refresh)
      backendUrl: null,
      setBackendUrl: (url) => set({ backendUrl: url }),
      
      // Theme state
      theme: getInitialTheme(),
      setTheme: (theme) => {
        set({ theme })
        if (typeof window !== "undefined") {
          localStorage.setItem("theme", theme)
          document.documentElement.classList.toggle("dark", theme === "dark")
        }
      },
      toggleTheme: () => {
        const currentTheme = get().theme
        const newTheme = currentTheme === "dark" ? "light" : "dark"
        set({ theme: newTheme })
        if (typeof window !== "undefined") {
          localStorage.setItem("theme", newTheme)
          document.documentElement.classList.toggle("dark", newTheme === "dark")
        }
      },
      
      // Selected chain state
      selectedChainId: null,
      setSelectedChainId: (id) => set({ selectedChainId: id }),
      clearSelection: () => set({ selectedChainId: null }),
      
      // Workflow state
      chainId: null,
      workflow: null,
      chainUpdatedAt: null,
      chainTags: null,
      isLoading: false,
      isSaving: false,
      
      // Step Detail View state
      selectedStepNodeId: null,
      setSelectedStepNodeId: (nodeId) => set({ selectedStepNodeId: nodeId }),
      selectedStepTab: null,
      setSelectedStepTab: (tab) => set({ selectedStepTab: tab }),
      
      // UI state
      
      // Workflow actions
      loadWorkflow: (chainId: number, data: any, updatedAt: string, tags: string[]) => {
        let workflow: HttpChain | null = null
        
        if (data) {
          const steps = (data.steps || []).map((step: any): Step => ({
            ...step,
            node_id: step.node_id || generateUUID(),
          }))
          
          workflow = {
            version: data.version || 1,
            name: data.name || "New Chain",
            steps,
            chain_variables: data.chain_variables || [],
          }
        }
        
        if (!workflow) {
          workflow = {
            version: 1,
            name: "New Chain",
            chain_variables: [],
            steps: [],
          }
        }
        
        set({ chainId, workflow, chainUpdatedAt: updatedAt, chainTags: tags, isLoading: false })
      },
      
      addInputVariable: async (variableName: string) => {
        const { chainId, workflow } = get()
        if (!chainId || !workflow) return
        
        if (workflow.chain_variables.includes(variableName)) {
          toast.warning("Variable already exists", `The variable "${variableName}" is already in the workflow.`)
          return
        }
        
        const updatedWorkflow: HttpChain = {
          ...workflow,
          chain_variables: [...workflow.chain_variables, variableName],
        }
        
        set({ workflow: updatedWorkflow, isSaving: true })
        
        try {
          const response = await saveWorkflowToDb(chainId, updatedWorkflow)
          set({ 
            chainUpdatedAt: response.updated_at,
            chainTags: response.tags,
            isSaving: false 
          })
        } catch (error) {
          toast.error("Failed to save workflow", error instanceof Error ? error.message : "An unexpected error occurred")
          set({ workflow, isSaving: false })
        }
      },
      
      addStep: async (stepData?: Partial<Step>) => {
        const { chainId, workflow } = get()
        if (!chainId || !workflow) return
        
        const newStep: Step = {
          ...createEmptyStep(),
          name: `Step ${workflow.steps.length + 1}`,
          ...stepData,
        }
        
        const updatedWorkflow: HttpChain = {
          ...workflow,
          steps: [...workflow.steps, newStep],
        }
        
        set({ workflow: updatedWorkflow, isSaving: true })
        
        try {
          const response = await saveWorkflowToDb(chainId, updatedWorkflow)
          set({ 
            chainUpdatedAt: response.updated_at,
            chainTags: response.tags,
            isSaving: false 
          })
        } catch (error) {
          toast.error("Failed to save workflow", error instanceof Error ? error.message : "An unexpected error occurred")
          set({ workflow, isSaving: false })
        }
      },

      updateStep: async (nodeId: string, updates: Partial<Step>) => {
        const { chainId, workflow } = get()
        if (!chainId || !workflow) return
        
        const stepIndex = workflow.steps.findIndex(s => s.node_id === nodeId)
        if (stepIndex === -1) return
        
        const updatedSteps = [...workflow.steps]
        updatedSteps[stepIndex] = {
          ...updatedSteps[stepIndex],
          ...updates,
          node_id: nodeId, // Preserve node_id
        }
        
        const updatedWorkflow: HttpChain = {
          ...workflow,
          steps: updatedSteps,
        }
        
        set({ workflow: updatedWorkflow, isSaving: true })
        
        try {
          const response = await saveWorkflowToDb(chainId, updatedWorkflow)
          set({ 
            chainUpdatedAt: response.updated_at,
            chainTags: response.tags,
            isSaving: false 
          })
        } catch (error) {
          toast.error("Failed to save workflow", error instanceof Error ? error.message : "An unexpected error occurred")
          set({ workflow, isSaving: false })
        }
      },
      
      updateChainName: async (name: string) => {
        const { chainId, workflow } = get()
        if (!chainId || !workflow) return
        
        const updatedWorkflow: HttpChain = {
          ...workflow,
          name,
        }
        
        set({ workflow: updatedWorkflow, isSaving: true })
        
        try {
          const response = await saveWorkflowToDb(chainId, updatedWorkflow)
          set({ 
            chainUpdatedAt: response.updated_at,
            chainTags: response.tags,
            isSaving: false 
          })
        } catch (error) {
          toast.error("Failed to save workflow", error instanceof Error ? error.message : "An unexpected error occurred")
          set({ workflow, isSaving: false })
        }
      },
      
      updateChainTags: async (tags: string[]) => {
        const { chainId } = get()
        if (!chainId) return
        
        const prevTags = get().chainTags
        set({ chainTags: tags, isSaving: true })
        
        try {
          const response = await updateChain(chainId, { tags })
          set({ 
            chainUpdatedAt: response.updated_at,
            chainTags: response.tags,
            isSaving: false 
          })
        } catch (error) {
          toast.error("Failed to update tags", error instanceof Error ? error.message : "An unexpected error occurred")
          set({ chainTags: prevTags, isSaving: false })
        }
      },
      
      removeInputVariable: async (variableName: string) => {
        const { chainId, workflow } = get()
        if (!chainId || !workflow) return
        
        const updatedWorkflow: HttpChain = {
          ...workflow,
          chain_variables: workflow.chain_variables.filter(v => v !== variableName),
        }
        
        set({ workflow: updatedWorkflow, isSaving: true })
        
        try {
          const response = await saveWorkflowToDb(chainId, updatedWorkflow)
          set({ 
            chainUpdatedAt: response.updated_at,
            chainTags: response.tags,
            isSaving: false 
          })
        } catch (error) {
          toast.error("Failed to save workflow", error instanceof Error ? error.message : "An unexpected error occurred")
          set({ workflow, isSaving: false })
        }
      },
      
      removeStep: async (nodeId: string) => {
        const { chainId, workflow } = get()
        if (!chainId || !workflow) return
        
        const updatedWorkflow: HttpChain = {
          ...workflow,
          steps: workflow.steps.filter(s => s.node_id !== nodeId),
        }
        
        set({ workflow: updatedWorkflow, isSaving: true })
        
        try {
          const response = await saveWorkflowToDb(chainId, updatedWorkflow)
          set({ 
            chainUpdatedAt: response.updated_at,
            chainTags: response.tags,
            isSaving: false 
          })
        } catch (error) {
          toast.error("Failed to save workflow", error instanceof Error ? error.message : "An unexpected error occurred")
          set({ workflow, isSaving: false })
        }
      },
      
      clearWorkflow: () => {
        set({
          chainId: null,
          workflow: null,
          chainUpdatedAt: null,
          chainTags: null,
          isLoading: false,
          isSaving: false,
        })
      },
    }),
    {
      name: "app-store",
      partialize: (state) => ({
        theme: state.theme,
      }),
    }
  )
)

// Initialize theme on load
if (typeof window !== "undefined") {
  const theme = useAppStore.getState().theme
  document.documentElement.classList.toggle("dark", theme === "dark")
}

